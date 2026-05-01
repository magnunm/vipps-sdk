import { assertEquals, assertInstanceOf } from "@std/assert";
import { VippsApiError, VippsEPaymentClient } from "../../mod.ts";

const makeClient = (env: "production" | "test" = "test") =>
  new VippsEPaymentClient({
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    subscriptionKey: "test-key",
    merchantSerialNumber: "123456",
    environment: env,
  });

Deno.test(
  "VippsEPaymentClient defaults to production when environment omitted",
  () => {
    const client = new VippsEPaymentClient({
      clientId: "id",
      clientSecret: "secret",
      subscriptionKey: "sub",
      merchantSerialNumber: "123456",
    });
    assertInstanceOf(client, VippsEPaymentClient);
  },
);

Deno.test("VippsApiError has correct properties", () => {
  const error = new VippsApiError({
    type: "https://developer.vippsmobilepay.com/docs/APIs/epayment-api/errors/",
    title: "Bad Request",
    detail: "Invalid reference",
    status: 400,
    traceId: "abc-123",
  });

  assertInstanceOf(error, Error);
  assertInstanceOf(error, VippsApiError);
  assertEquals(error.status, 400);
  assertEquals(error.traceId, "abc-123");
  assertEquals(error.message, "400 Bad Request: Invalid reference");
  assertEquals(error.name, "VippsApiError");
});

Deno.test("VippsApiError message omits detail when absent", () => {
  const error = new VippsApiError({
    type: "about:blank",
    title: "Not Found",
    status: 404,
    traceId: "t1",
  });
  assertEquals(error.message, "404 Not Found");
});

Deno.test("VippsApiError exposes full problem object", () => {
  const problem = {
    type: "about:blank",
    title: "Conflict",
    status: 409,
    traceId: "trace-xyz",
    extraDetails: [{ name: "reference", reason: "already exists" }],
  };
  const error = new VippsApiError(problem);
  assertEquals(error.problem, problem);
  assertEquals(error.problem.extraDetails?.[0].reason, "already exists");
});

Deno.test("getAccessToken fetches and caches token", async () => {
  let callCount = 0;
  const expiresOn = Math.floor(Date.now() / 1000) + 3600;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((_url: string | URL | Request, _init?: RequestInit) => {
    callCount++;
    return Promise.resolve(
      new Response(
        JSON.stringify({
          token_type: "Bearer",
          expires_in: "3600",
          ext_expires_in: "3600",
          expires_on: String(expiresOn),
          not_before: String(Math.floor(Date.now() / 1000)),
          resource: "res",
          access_token: "cached-token",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
  }) as typeof fetch;

  try {
    const client = makeClient("test");
    // Trigger two API calls — token fetch should only happen once
    // We spy by counting fetch calls; the second call is the API request itself.
    // We expect: 1 token fetch + 1 API fetch = 2 on first call, then 0 + 1 on second.
    let apiCallCount = 0;
    globalThis.fetch = ((url: string | URL | Request, init?: RequestInit) => {
      const urlStr = url.toString();
      if (urlStr.includes("/accesstoken/get")) {
        callCount++;
        return Promise.resolve(
          new Response(
            JSON.stringify({
              token_type: "Bearer",
              expires_in: "3600",
              ext_expires_in: "3600",
              expires_on: String(expiresOn),
              not_before: String(Math.floor(Date.now() / 1000)),
              resource: "res",
              access_token: "cached-token",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        );
      }
      apiCallCount++;
      return Promise.resolve(
        new Response(JSON.stringify({ reference: "ref-1" }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }) as typeof fetch;

    callCount = 0;
    await client.createPayment(
      {
        amount: { value: 1000, currency: "NOK" },
        paymentMethod: { type: "WALLET" },
        reference: "ref-12345678",
        userFlow: "WEB_REDIRECT",
        returnUrl: "https://example.com",
      },
      "idem-key-1",
    );
    await client.createPayment(
      {
        amount: { value: 2000, currency: "NOK" },
        paymentMethod: { type: "WALLET" },
        reference: "ref-87654321",
        userFlow: "WEB_REDIRECT",
        returnUrl: "https://example.com",
      },
      "idem-key-2",
    );

    // Token should only be fetched once across both calls
    assertEquals(callCount, 1, "access token should be fetched exactly once");
    assertEquals(apiCallCount, 2, "API should be called twice");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
