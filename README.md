# vipps-sdk

An *unofficial* TypeScript SDK for the [Vipps MobilePay ePayment
API](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/).

## Installation

With npm:

```sh
npm i vipps-sdk
```

With Deno:

```sh
deno add jsr:@magnunm/vipps-sdk
```

## Quick start

```ts
import { VippsEPaymentClient } from "vipps-sdk";

const client = new VippsEPaymentClient({
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  subscriptionKey: "your-subscription-key",
  merchantSerialNumber: "your-msn",
  environment: "test", // or "production"
});

// Create a payment and redirect the customer
const payment = await client.createPayment({
  amount: { value: 10000, currency: "NOK" }, // 100.00 NOK (amounts are in øre/minor units)
  paymentMethod: { type: "WALLET" },
  reference: "order-abc-123",
  userFlow: "WEB_REDIRECT",
  returnUrl: "https://example.com/order/abc-123/receipt",
});

console.log(payment.redirectUrl); // send the customer here
```

## Configuration

See the [ePayment
documentation](https://developer.vippsmobilepay.com/docs/APIs/epayment-api/)
for a guide on how to configure these values.

| Field | Required | Description |
|---|---|---|
| `clientId` | Yes | OAuth2 client ID from the Vipps developer portal |
| `clientSecret` | Yes | OAuth2 client secret |
| `subscriptionKey` | Yes | `Ocp-Apim-Subscription-Key` from the developer portal |
| `merchantSerialNumber` | Yes | Your Merchant Serial Number (MSN) |
| `environment` | No | `"production"` (default) or `"test"` |
| `systemName` | No | Name of your integration/platform, sent as `Vipps-System-Name` |
| `systemVersion` | No | Version of your integration, sent as `Vipps-System-Version` |
| `pluginName` | No | Plugin name, sent as `Vipps-System-Plugin-Name` |
| `pluginVersion` | No | Plugin version, sent as `Vipps-System-Plugin-Version` |

## API

Methods that mutate state (`createPayment`, `capturePayment`, `refundPayment`)
accept an optional idempotency key. A unique key is generated automatically if
you omit it. If you retry a failed request you must generate the idempotency
key yourself and pass the same key you used in the original call. This avoids
erroneously duplicating the operation.

### `createPayment(request, idempotencyKey?)`

Creates a new payment. Returns `{ reference, redirectUrl? }`.

```ts
const { reference, redirectUrl } = await client.createPayment({
  amount: { value: 4990, currency: "NOK" },
  paymentMethod: { type: "WALLET" },
  reference: "my-order-001",
  userFlow: "WEB_REDIRECT",
  returnUrl: "https://example.com/thanks",
  paymentDescription: "Coffee and a muffin",
});
```

### `getPayment(reference)`

Fetches the current state of a payment.

```ts
const payment = await client.getPayment("my-order-001");
console.log(payment.state); // "AUTHORIZED" | "CAPTURED" | "ABORTED" | ...
console.log(payment.aggregate.capturedAmount);
```

### `getPaymentEventLog(reference)`

Returns the full event history for a payment as `PaymentEvent[]`.

```ts
const events = await client.getPaymentEventLog("my-order-001");
for (const event of events) {
  console.log(event.name, event.amount, event.timestamp);
}
```

### `capturePayment(reference, body, idempotencyKey?)`

Captures a previously authorized payment, in full or partially.

```ts
await client.capturePayment(
  "my-order-001",
  { modificationAmount: { value: 4990, currency: "NOK" } },
);
```

### `cancelPayment(reference, body?)`

Cancels an authorized or created payment.

```ts
await client.cancelPayment("my-order-001");
// or, to cancel only the transaction without touching the reservation:
await client.cancelPayment("my-order-001", { cancelTransactionOnly: true });
```

### `refundPayment(reference, body, idempotencyKey?)`

Refunds a captured payment, in full or partially.

```ts
await client.refundPayment(
  "my-order-001",
  { modificationAmount: { value: 4990, currency: "NOK" } },
);
```

### `forceApprove(reference, body?)` (test environment only)

Simulates a customer approving a payment. Can be used in automated tests.

```ts
await client.forceApprove("my-order-001");
```

## Error handling

All API errors throw `VippsApiError`, which extends `Error` and exposes the
structured problem details from the Vipps API.

```ts
import { VippsApiError } from "vipps-sdk";

try {
  await client.capturePayment("my-order-001", { modificationAmount: { value: 9999, currency: "NOK" } });
} catch (err) {
  if (err instanceof VippsApiError) {
    console.error(err.status);    // HTTP status code, e.g. 400
    console.error(err.traceId);   // Vipps trace ID for support requests
    console.error(err.problem);   // full VippsProblem object
  }
}
```

## Webhook events

The `WebhookEvent` type models the payload Vipps sends to your callback URL when payment state changes. Use it to type your webhook handler:

```ts
import type { WebhookEvent } from "vipps-sdk";

async function handleWebhook(req: Request): Promise<Response> {
  const event = await req.json() as WebhookEvent;
  console.log(event.name, event.reference, event.amount);
  return new Response(null, { status: 200 });
}
```

## Development

This project uses the Deno runtime.

```sh
# Run tests
deno task test

# Check types without running tests
deno check mod.ts

# Download the OpenAPI spec and verify the SDKs compatibility with it.
deno task test:integration
```

A Node/npm compatible package can be built with `deno task build:npm`, it will
be placed in the `npm/` directory.

## License

MIT

## Disclaimer

This project is not affiliated with Vipps or MobilePay in any way. Created this
project for my apps using Vipps payment when the `@vippsno/vipps-sdk` package
was deprecated.
