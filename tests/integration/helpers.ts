import { parse } from "@std/yaml";

const SPEC_URL =
  "https://developer.vippsmobilepay.com/redocusaurus/epayment-swagger-id.yaml";

export type SpecSchema = {
  enum?: string[];
  required?: string[];
  properties?: Record<string, SpecSchema>;
};

export type OpenApiSpec = {
  paths: Record<string, Record<string, unknown>>;
  components: {
    schemas: Record<string, SpecSchema>;
  };
};

export async function fetchSpec(): Promise<OpenApiSpec> {
  const res = await fetch(SPEC_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch spec: ${res.status} ${res.statusText}`);
  }
  return parse(await res.text()) as OpenApiSpec;
}

export const typesSource = await Deno.readTextFile(
  new URL("../../src/types.ts", import.meta.url),
);

/** Extracts values from a TypeScript union type, e.g. `export type Foo = "A" | "B";` */
export function extractUnionValues(typeName: string): string[] {
  const match = typesSource.match(
    new RegExp(`export type ${typeName}\\s*=\\s*([^;]+);`, "s"),
  );
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();
}

/** Extracts the names of required (non-optional) properties from a TypeScript interface. */
export function extractRequiredProps(interfaceName: string): string[] {
  const startMatch = typesSource.match(
    new RegExp(`export interface ${interfaceName}\\s*\\{`),
  );
  if (!startMatch || startMatch.index === undefined) return [];

  const bodyStart = startMatch.index + startMatch[0].length;
  let depth = 1;
  let i = bodyStart;
  while (i < typesSource.length && depth > 0) {
    if (typesSource[i] === "{") depth++;
    else if (typesSource[i] === "}") depth--;
    i++;
  }

  const body = typesSource.slice(bodyStart, i - 1);
  const required: string[] = [];
  for (const line of body.split("\n")) {
    // Matches "  propName: type" but not "  propName?: type"
    const m = line.match(/^\s+([a-zA-Z]\w*)\s*:\s+/);
    if (m) required.push(m[1]);
  }
  return required.sort();
}
