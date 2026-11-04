import { headers } from "next/headers";
import {
  getFixtureIdentity,
  IDENTITY_FIXTURE_NAMES,
  type IdentityFixtureName,
  isIdentityFixtureName,
} from "./fixture-identity";
import { createIdentity, type Identity } from "./identity";
import { createSupabaseIdentityGateway } from "./supabase-identity-gateway";

/**
 * Returns the Identity for the current request. When `IDENTITY_FIXTURE` is
 * set (integration tests), an in-memory auth provider with seeded test logins
 * replaces Supabase Auth; header `x-identity-fixture` overrides the fixture
 * name for a single request.
 */
export async function getIdentity(): Promise<Identity> {
  const fixtureFromEnv = process.env.IDENTITY_FIXTURE;
  if (fixtureFromEnv) {
    return getFixtureIdentity(await resolveFixtureName(fixtureFromEnv));
  }

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sessionSecret = process.env.SESSION_SECRET;
  if (!url || !serviceRoleKey || !sessionSecret) {
    throw new Error(
      "SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SESSION_SECRET are required for Accounts",
    );
  }

  const origin = await requestOrigin();
  return createIdentity({
    gateway: createSupabaseIdentityGateway({
      url,
      serviceRoleKey,
      links: {
        verifyEmailUrl: `${origin}/account/verify-email`,
        resetPasswordUrl: `${origin}/account/reset-password`,
      },
    }),
    sessionSecret,
  });
}

/**
 * The site the Customer is on, so nonprod links lead back to nonprod. Supabase
 * Auth only honours origins on its Redirect URLs allow-list.
 */
async function requestOrigin(): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host")
    ? headerStore.get("x-forwarded-host")
    : headerStore.get("host");
  if (!host) {
    throw new Error("Cannot build Account email links without a Host header");
  }
  const defaultProtocol =
    process.env.NODE_ENV === "production" ? "https" : "http";
  const protocol = headerStore.get("x-forwarded-proto")
    ? headerStore.get("x-forwarded-proto")
    : defaultProtocol;
  return `${protocol}://${host}`;
}

async function resolveFixtureName(
  fallback: string,
): Promise<IdentityFixtureName> {
  const headerStore = await headers();
  const fromHeader = headerStore.get("x-identity-fixture");
  if (fromHeader && isIdentityFixtureName(fromHeader)) {
    return fromHeader;
  }

  if (isIdentityFixtureName(fallback)) {
    return fallback;
  }

  throw new Error(
    `Unknown IDENTITY_FIXTURE "${fallback}". Expected ${IDENTITY_FIXTURE_NAMES.join(", ")}.`,
  );
}
