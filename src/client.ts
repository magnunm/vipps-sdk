import { VippsApiError } from "./errors.ts";
import type {
  AccessTokenResponse,
  CancelModificationRequest,
  CaptureModificationRequest,
  CreatePaymentRequest,
  CreatePaymentResponse,
  ForceApproveRequest,
  GetPaymentResponse,
  ModificationResponse,
  PaymentEvent,
  RefundModificationRequest,
  VippsClientConfig,
  VippsProblem,
} from "./types.ts";

const BASE_HOSTS = {
  production: "https://api.vipps.no",
  test: "https://apitest.vipps.no",
} as const;

/** 30 seconds buffer before the token's stated expiry. */
const TOKEN_EXPIRY_BUFFER_MS = 30_000;

interface TokenCache {
  token: string;
  /** Absolute timestamp (ms) after which the token should be refreshed. */
  expiresAt: number;
}

export class VippsEPaymentClient {
  private readonly host: string;
  private readonly config: VippsClientConfig;
  private tokenCache: TokenCache | null = null;

  constructor(config: VippsClientConfig) {
    this.config = config;
    this.host = BASE_HOSTS[config.environment ?? "production"];
  }

  createPayment(
    request: CreatePaymentRequest,
    idempotencyKey: string = crypto.randomUUID(),
  ): Promise<CreatePaymentResponse> {
    return this.request<CreatePaymentResponse>("POST", "/v1/payments", {
      body: request,
      extraHeaders: { "Idempotency-Key": idempotencyKey },
    });
  }

  getPayment(reference: string): Promise<GetPaymentResponse> {
    return this.request<GetPaymentResponse>(
      "GET",
      `/v1/payments/${encodeURIComponent(reference)}`,
    );
  }

  getPaymentEventLog(reference: string): Promise<PaymentEvent[]> {
    return this.request<PaymentEvent[]>(
      "GET",
      `/v1/payments/${encodeURIComponent(reference)}/events`,
    );
  }

  cancelPayment(
    reference: string,
    body?: CancelModificationRequest,
  ): Promise<ModificationResponse> {
    return this.request<ModificationResponse>(
      "POST",
      `/v1/payments/${encodeURIComponent(reference)}/cancel`,
      { body },
    );
  }

  capturePayment(
    reference: string,
    body: CaptureModificationRequest,
    idempotencyKey: string = crypto.randomUUID(),
  ): Promise<ModificationResponse> {
    return this.request<ModificationResponse>(
      "POST",
      `/v1/payments/${encodeURIComponent(reference)}/capture`,
      { body, extraHeaders: { "Idempotency-Key": idempotencyKey } },
    );
  }

  refundPayment(
    reference: string,
    body: RefundModificationRequest,
    idempotencyKey: string = crypto.randomUUID(),
  ): Promise<ModificationResponse> {
    return this.request<ModificationResponse>(
      "POST",
      `/v1/payments/${encodeURIComponent(reference)}/refund`,
      { body, extraHeaders: { "Idempotency-Key": idempotencyKey } },
    );
  }

  /** Only available in the test environment. */
  forceApprove(reference: string, body?: ForceApproveRequest): Promise<void> {
    return this.request<void>(
      "POST",
      `/v1/test/payments/${encodeURIComponent(reference)}/approve`,
      { body },
    );
  }

  private async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    const response = await fetch(`${this.host}/accesstoken/get`, {
      method: "POST",
      headers: {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        "Ocp-Apim-Subscription-Key": this.config.subscriptionKey,
      },
    });

    if (!response.ok) {
      let problem: VippsProblem;
      try {
        problem = (await response.json()) as VippsProblem;
      } catch {
        problem = {
          type: "about:blank",
          title: `Failed to fetch access token: ${response.statusText}`,
          status: response.status,
          traceId: "",
        };
      }
      throw new VippsApiError(problem);
    }

    let data: AccessTokenResponse;
    try {
      data = (await response.json()) as AccessTokenResponse;
    } catch {
      throw new Error("Failed to parse access token response body");
    }

    // expires_on is a Unix timestamp in seconds, returned as a string
    const expiresAt = Number(data.expires_on) * 1000 - TOKEN_EXPIRY_BUFFER_MS;
    this.tokenCache = { token: data.access_token, expiresAt };
    return data.access_token;
  }

  private buildHeaders(token: string, extra?: Record<string, string>): Headers {
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": this.config.subscriptionKey,
      "Merchant-Serial-Number": this.config.merchantSerialNumber,
    });

    if (this.config.systemName) {
      headers.set("Vipps-System-Name", this.config.systemName);
    }
    if (this.config.systemVersion) {
      headers.set("Vipps-System-Version", this.config.systemVersion);
    }
    if (this.config.pluginName) {
      headers.set("Vipps-System-Plugin-Name", this.config.pluginName);
    }
    if (this.config.pluginVersion) {
      headers.set("Vipps-System-Plugin-Version", this.config.pluginVersion);
    }

    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        headers.set(key, value);
      }
    }

    return headers;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: { body?: unknown; extraHeaders?: Record<string, string> },
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${this.host}/epayment${path}`;
    const headers = this.buildHeaders(token, options?.extraHeaders);

    const response = await fetch(url, {
      method,
      headers,
      body:
        options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      let problem: VippsProblem;
      try {
        problem = (await response.json()) as VippsProblem;
      } catch {
        problem = {
          type: "about:blank",
          title: response.statusText,
          status: response.status,
          traceId: "",
        };
      }
      throw new VippsApiError(problem);
    }

    if (
      response.status === 204 ||
      response.headers.get("Content-Length") === "0"
    ) {
      return undefined as T;
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new Error(`Failed to parse response body for ${method} ${path}`);
    }
  }
}
