/**
 * An unofficial TypeScript SDK for the Vipps MobilePay ePayment API.
 *
 * @example
 * ```ts
 * import { VippsEPaymentClient } from "vipps-sdk";
 *
 * const client = new VippsEPaymentClient({
 *   clientId: "your-client-id",
 *   clientSecret: "your-client-secret",
 *   subscriptionKey: "your-subscription-key",
 *   merchantSerialNumber: "your-msn",
 *   environment: "test", // or "production"
 * });
 *
 * // Create a payment and redirect the customer
 * const payment = await client.createPayment({
 *   amount: { value: 10000, currency: "NOK" }, // 100.00 NOK (amounts are in ore/minor units)
 *   paymentMethod: { type: "WALLET" },
 *   reference: "order-abc-123",
 *   userFlow: "WEB_REDIRECT",
 *   returnUrl: "https://example.com/order/abc-123/receipt",
 * });
 *
 * console.log(payment.redirectUrl); // send the customer here
 * ```
 *
 * @module
 */

export { VippsEPaymentClient } from "./src/client.ts";
export { VippsApiError } from "./src/errors.ts";
export type {
  AccessTokenResponse,
  Address,
  Aggregate,
  AirlineData,
  Amount,
  Barcode,
  BlockedPaymentSources,
  BottomLine,
  CancelModificationRequest,
  CaptureModificationRequest,
  CardPassthrough,
  CreatePaymentRequest,
  CreatePaymentResponse,
  Currency,
  Customer,
  CustomerInteraction,
  CustomerPhoneNumber,
  CustomerToken,
  DynamicOptions,
  ExtraDetail,
  FixedOptions,
  ForceApproveRequest,
  GetPaymentResponse,
  IndustryData,
  ModificationResponse,
  OrderLine,
  PaymentEvent,
  PaymentEventName,
  PaymentMethod,
  PaymentMethodResponse,
  PaymentMethodType,
  PaymentSources,
  PaymentState,
  PersonalQrCode,
  ProfileRequest,
  ProfileResponse,
  QrFormat,
  QrFormatOptions,
  QuantityUnit,
  Receipt,
  RefundModificationRequest,
  Shipping,
  ShippingDetails,
  ShippingGroup,
  ShippingInfo,
  ShippingOption,
  UnitInfo,
  UserDetails,
  UserFlow,
  VippsClientConfig,
  VippsProblem,
  WebhookEvent,
} from "./src/types.ts";
