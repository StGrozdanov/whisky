import { createIdentity, type Identity } from "./identity";
import { createInMemoryIdentityGateway } from "./in-memory-identity-gateway";
import type { IdentityGateway } from "./types";

export const IDENTITY_FIXTURE_NAMES = ["accounts", "error"] as const;
export type IdentityFixtureName = (typeof IDENTITY_FIXTURE_NAMES)[number];

const FIXTURE_SESSION_SECRET = "integration-fixture-session-secret";

const identities = new Map<IdentityFixtureName, Identity>();

export function isIdentityFixtureName(
  value: string,
): value is IdentityFixtureName {
  return (IDENTITY_FIXTURE_NAMES as readonly string[]).includes(value);
}

export function getFixtureIdentity(name: IdentityFixtureName): Identity {
  const existing = identities.get(name);
  if (existing) {
    return existing;
  }

  const identity = createIdentity({
    gateway: name === "error" ? createErrorGateway() : createAccountsGateway(),
    sessionSecret: FIXTURE_SESSION_SECRET,
  });
  identities.set(name, identity);
  return identity;
}

/** Test logins documented in docs/agents/testing.md. */
function createAccountsGateway(): IdentityGateway {
  return createInMemoryIdentityGateway({
    shopkeeper: {
      email: "shopkeeper@fixture.test",
      password: "fixture-shopkeeper-password",
    },
    members: [
      {
        firstName: "Иван",
        lastName: "Петров",
        email: "member@fixture.test",
        password: "fixture-member-password",
        verified: true,
      },
      {
        firstName: "Елена",
        lastName: "Стоянова",
        email: "unverified@fixture.test",
        password: "fixture-member-password",
        verified: false,
      },
    ],
  });
}

function createErrorGateway(): IdentityGateway {
  const fail = async (): Promise<never> => {
    throw new Error("Fixture auth provider failure");
  };
  return {
    registerCustomer: fail,
    verifyEmail: fail,
    checkPassword: fail,
    sendPasswordReset: fail,
    resetPassword: fail,
    passwordChangedAt: fail,
    findMember: fail,
    findShopkeeper: fail,
  };
}
