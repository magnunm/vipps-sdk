import { assertEquals, assertExists } from "@std/assert";
import {
  extractRequiredProps,
  extractUnionValues,
  fetchSpec,
} from "./helpers.ts";

const spec = await fetchSpec();
const schemas = spec.components.schemas;

Deno.test("all expected API paths exist in spec", () => {
  const { paths } = spec;
  assertExists(paths["/v1/payments"]);
  assertExists(paths["/v1/payments/{Reference}"]);
  assertExists(paths["/v1/payments/{Reference}/events"]);
  assertExists(paths["/v1/payments/{Reference}/cancel"]);
  assertExists(paths["/v1/payments/{Reference}/capture"]);
  assertExists(paths["/v1/payments/{Reference}/refund"]);
  assertExists(paths["/v1/test/payments/{Reference}/approve"]);
});

Deno.test("endpoint HTTP methods match spec", () => {
  const { paths } = spec;
  assertExists(paths["/v1/payments"]["post"], "createPayment must be POST");
  assertExists(
    paths["/v1/payments/{Reference}"]["get"],
    "getPayment must be GET",
  );
  assertExists(
    paths["/v1/payments/{Reference}/events"]["get"],
    "getPaymentEventLog must be GET",
  );
  assertExists(
    paths["/v1/payments/{Reference}/cancel"]["post"],
    "cancelPayment must be POST",
  );
  assertExists(
    paths["/v1/payments/{Reference}/capture"]["post"],
    "capturePayment must be POST",
  );
  assertExists(
    paths["/v1/payments/{Reference}/refund"]["post"],
    "refundPayment must be POST",
  );
  assertExists(
    paths["/v1/test/payments/{Reference}/approve"]["post"],
    "forceApprove must be POST",
  );
});

// --- Enum alignment ---

Deno.test("Currency enum matches spec", () => {
  assertEquals(
    extractUnionValues("Currency"),
    [...schemas["Currency"].enum!].sort(),
  );
});

Deno.test("PaymentMethodType enum matches spec", () => {
  assertEquals(
    extractUnionValues("PaymentMethodType"),
    [...schemas["PaymentMethodType"].enum!].sort(),
  );
});

Deno.test("PaymentState enum matches spec State schema", () => {
  assertEquals(
    extractUnionValues("PaymentState"),
    [...schemas["State"].enum!].sort(),
  );
});

Deno.test("PaymentEventName enum matches spec", () => {
  assertEquals(
    extractUnionValues("PaymentEventName"),
    [...schemas["PaymentEventName"].enum!].sort(),
  );
});

Deno.test("BlockedPaymentSources enum matches spec", () => {
  assertEquals(
    extractUnionValues("BlockedPaymentSources"),
    [...schemas["BlockedPaymentSources"].enum!].sort(),
  );
});

Deno.test("UserFlow enum matches spec", () => {
  const specEnum =
    schemas["CreatePaymentRequest"].properties!["userFlow"].enum!;
  assertEquals(extractUnionValues("UserFlow"), [...specEnum].sort());
});

Deno.test("CustomerInteraction enum matches spec", () => {
  const specEnum =
    schemas["CreatePaymentRequest"].properties!["customerInteraction"].enum!;
  assertEquals(extractUnionValues("CustomerInteraction"), [...specEnum].sort());
});

Deno.test("QrFormat enum matches spec", () => {
  const specEnum =
    schemas["CreatePaymentRequest"].properties!["qrFormat"].properties![
      "format"
    ].enum!;
  assertEquals(extractUnionValues("QrFormat"), [...specEnum].sort());
});

Deno.test("QuantityUnit enum matches spec", () => {
  const specEnum = schemas["UnitInfo"].properties!["quantityUnit"].enum!;
  assertEquals(extractUnionValues("QuantityUnit"), [...specEnum].sort());
});

Deno.test("BarcodeFormat enum matches spec", () => {
  const specEnum = schemas["Barcode"].properties!["format"].enum!;
  assertEquals(extractUnionValues("BarcodeFormat"), [...specEnum].sort());
});

// --- Required field alignment ---

Deno.test("Amount required fields match spec", () => {
  assertEquals(
    extractRequiredProps("Amount"),
    [...schemas["Amount"].required!].sort(),
  );
});

Deno.test("CreatePaymentRequest required fields match spec", () => {
  assertEquals(
    extractRequiredProps("CreatePaymentRequest"),
    [...schemas["CreatePaymentRequest"].required!].sort(),
  );
});

Deno.test("CreatePaymentResponse required fields match spec", () => {
  assertEquals(
    extractRequiredProps("CreatePaymentResponse"),
    [...schemas["CreatePaymentResponse"].required!].sort(),
  );
});

Deno.test("CaptureModificationRequest required fields match spec", () => {
  assertEquals(
    extractRequiredProps("CaptureModificationRequest"),
    [...schemas["CaptureModificationRequest"].required!].sort(),
  );
});

Deno.test("RefundModificationRequest required fields match spec", () => {
  assertEquals(
    extractRequiredProps("RefundModificationRequest"),
    [...schemas["RefundModificationRequest"].required!].sort(),
  );
});

Deno.test("ModificationResponse required fields match spec", () => {
  assertEquals(
    extractRequiredProps("ModificationResponse"),
    [...schemas["ModificationResponse"].required!].sort(),
  );
});

Deno.test("GetPaymentResponse required fields match spec", () => {
  assertEquals(
    extractRequiredProps("GetPaymentResponse"),
    [...schemas["GetPaymentResponse"].required!].sort(),
  );
});
