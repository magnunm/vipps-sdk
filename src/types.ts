export type Currency = "NOK" | "DKK" | "EUR" | "SEK" | "USD" | "GBP";

export type PaymentMethodType = "WALLET" | "CARD" | "CARD_PASSTHROUGH";

export type UserFlow = "PUSH_MESSAGE" | "NATIVE_REDIRECT" | "WEB_REDIRECT" | "QR";

export type CustomerInteraction = "CUSTOMER_PRESENT" | "CUSTOMER_NOT_PRESENT";

export type PaymentState = "CREATED" | "ABORTED" | "EXPIRED" | "AUTHORIZED" | "TERMINATED";

export type PaymentEventName =
  | "CREATED"
  | "ABORTED"
  | "EXPIRED"
  | "CANCELLED"
  | "CAPTURED"
  | "REFUNDED"
  | "AUTHORIZED"
  | "TERMINATED";

export type BlockedPaymentSources = "COMMERCIAL_CARDS";

export type QrFormat = "TEXT/TARGETURL" | "IMAGE/SVG+XML" | "IMAGE/PNG";

export type QuantityUnit = "PCS" | "KG" | "KM" | "MINUTE" | "LITRE" | "KWH";

export type BarcodeFormat = "EAN-13" | "CODE 39" | "CODE 128";

export interface Amount {
  value: number;
  currency: Currency;
}

export interface CustomerPhoneNumber {
  phoneNumber: string;
}

export interface PersonalQrCode {
  personalQr: string;
}

export interface CustomerToken {
  customerToken: string;
}

export type Customer = CustomerPhoneNumber | PersonalQrCode | CustomerToken;

export interface PaymentMethod {
  type: PaymentMethodType;
  blockedSources?: BlockedPaymentSources[];
}

export interface ProfileRequest {
  scope?: string;
}

export interface UnitInfo {
  unitPrice: number | null;
  quantity: string;
  quantityUnit?: QuantityUnit | null;
}

export interface OrderLine {
  name: string;
  id: string;
  totalAmount: number;
  totalAmountExcludingTax: number;
  totalTaxAmount: number;
  taxRate?: number | null;
  unitInfo?: UnitInfo;
  discount?: number | null;
  productUrl?: string | null;
  isReturn?: boolean | null;
  isShipping?: boolean | null;
}

export interface Barcode {
  format: BarcodeFormat | null;
  data: string | null;
}

export interface PaymentSources {
  giftCard?: number | null;
  card?: number | null;
  voucher?: number | null;
  cash?: number | null;
}

export interface BottomLine {
  currency: Currency;
  tipAmount?: number | null;
  posId?: string | null;
  shippingInfo?: ShippingInfo;
  paymentSources?: PaymentSources;
  barcode?: Barcode;
  receiptNumber?: string | null;
}

export interface ShippingInfo {
  amount: number | null;
  amountExcludingTax: number | null;
  taxAmount: number | null;
  taxPercentage: number | null;
}

export interface Receipt {
  orderLines: OrderLine[];
  bottomLine: BottomLine;
}

export interface DynamicOptions {
  callbackUrl: string;
  callbackAuthorizationToken?: string;
}

export interface ShippingGroup {
  id: string;
  title: string;
  description?: string;
  amount: Amount;
  shippingOptions: ShippingOption[];
}

export interface ShippingOption {
  id: string;
  title: string;
  description?: string;
  amount: Amount;
  shippingMethodId?: string;
  isDefault?: boolean;
}

export type FixedOptions = ShippingGroup[];

export interface Shipping {
  dynamicOptions?: DynamicOptions;
  fixedOptions?: FixedOptions;
}

export interface CardPassthrough {
  pspReference: string;
  cardCallbackUrl: string;
  allowedCardTypes?: string[];
  preferVisaPartOfVisaDankort?: boolean;
  publicEncryptionKeyId?: string;
}

export interface AirlineData {
  agencyInvoiceNumber: string;
  airlineCode: string;
  airlineDesignatorCode: string;
  passengerName: string;
  ticketNumber?: string;
}

export interface IndustryData {
  airlineData?: AirlineData;
}

export interface QrFormatOptions {
  format: QrFormat;
  size?: number | null;
}

export interface CreatePaymentRequest {
  amount: Amount;
  paymentMethod: PaymentMethod;
  reference: string;
  userFlow: UserFlow;
  customer?: Customer;
  minimumUserAge?: number | null;
  customerInteraction?: CustomerInteraction;
  industryData?: IndustryData;
  profile?: ProfileRequest;
  returnUrl?: string;
  expiresAt?: string | null;
  qrFormat?: QrFormatOptions | null;
  paymentDescription?: string;
  receipt?: Receipt;
  metadata?: Record<string, string> | null;
  receiptUrl?: string | null;
  shipping?: Shipping;
  cardPassthrough?: CardPassthrough;
}

export interface CreatePaymentResponse {
  reference: string;
  redirectUrl?: string;
}

export interface Aggregate {
  authorizedAmount: Amount;
  cancelledAmount: Amount;
  capturedAmount: Amount;
  refundedAmount: Amount;
}

export interface PaymentMethodResponse {
  type: PaymentMethodType;
  cardBin?: string;
}

export interface ProfileResponse {
  sub?: string;
}

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  postCode: string;
}

export interface ShippingDetails {
  address: Address;
  shippingCost: number;
  shippingOptionId: string;
  shippingOptionName: string;
}

export interface UserDetails {
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  dateOfBirth?: string;
  addresses?: Address[];
}

export interface GetPaymentResponse {
  aggregate: Aggregate;
  amount: Amount;
  state: PaymentState;
  paymentMethod: PaymentMethodResponse;
  profile: ProfileResponse;
  pspReference: string;
  reference: string;
  redirectUrl?: string;
  metadata?: Record<string, string> | null;
  shippingDetails?: ShippingDetails;
  userDetails?: UserDetails;
}

export interface PaymentEvent {
  reference: string;
  pspReference: string;
  name: PaymentEventName;
  amount: Amount;
  timestamp: string;
  idempotencyKey?: string | null;
  success: boolean;
}

export interface ModificationResponse {
  amount: Amount;
  state: PaymentState;
  aggregate: Aggregate;
  pspReference: string;
  reference: string;
}

export interface CancelModificationRequest {
  cancelTransactionOnly?: boolean;
}

export interface CaptureModificationRequest {
  modificationAmount: Amount;
}

export interface RefundModificationRequest {
  modificationAmount: Amount;
}

export interface ForceApproveRequest {
  customer?: Customer;
  token?: string;
}

export interface ExtraDetail {
  name: string;
  reason: string;
}

export interface VippsProblem {
  type: string;
  title: string;
  detail?: string;
  status: number;
  traceId: string;
  extraDetails?: ExtraDetail[] | null;
}

export interface WebhookEvent {
  msn: string;
  reference: string;
  pspReference: string;
  name: PaymentEventName;
  amount: Amount;
  timestamp: string;
  idempotencyKey?: string | null;
  success: boolean;
  shippingDetails?: ShippingDetails;
  userDetails?: UserDetails;
  sub?: string;
}

export interface VippsClientConfig {
  /** OAuth2 client ID. */
  clientId: string;
  /** OAuth2 client secret. */
  clientSecret: string;
  /** Vipps subscription key (Ocp-Apim-Subscription-Key). */
  subscriptionKey: string;
  /** Merchant serial number (MSN). */
  merchantSerialNumber: string;
  /** Target environment. Defaults to "production". */
  environment?: "production" | "test";
  /** Your system/integration name, included in request headers. */
  systemName?: string;
  /** Your system version, included in request headers. */
  systemVersion?: string;
  /** Your plugin name, included in request headers. */
  pluginName?: string;
  /** Your plugin version, included in request headers. */
  pluginVersion?: string;
}

export interface AccessTokenResponse {
  token_type: string;
  /** Seconds until expiry, returned as a string by the Vipps API. */
  expires_in: string;
  /** Unix timestamp of expiry, returned as a string by the Vipps API. */
  expires_on: string;
  not_before: string;
  resource: string;
  access_token: string;
}
