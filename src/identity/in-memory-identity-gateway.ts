import type { Clock } from "@/shop/types";
import type {
  IdentityGateway,
  Member,
  PasswordCheck,
  RegistrationInput,
  RegistrationOutcome,
  Shopkeeper,
} from "./types";

type StoredLogin = {
  id: string;
  email: string;
  password: string;
  verified: boolean;
  passwordChangedAt?: Date;
  account?: { firstName: string; lastName: string };
  shopkeeper?: true;
};

/** A link the in-memory provider would have emailed. */
export type SentLink = {
  to: string;
  kind: "verify-email" | "reset-password";
  tokenHash: string;
};

/**
 * In-memory auth provider for Vitest and the integration fixtures. Link
 * tokens are predictable (`verify-email:<email>`) so integration tests can
 * open them without reading an inbox.
 */
export function createInMemoryIdentityGateway(options?: {
  shopkeeper?: { email: string; password: string };
  members?: (RegistrationInput & { verified: boolean })[];
  clock?: Clock;
}): IdentityGateway & {
  sentLinks: SentLink[];
} {
  const clock = options?.clock ? options.clock : { now: () => new Date() };
  const logins = new Map<string, StoredLogin>();
  if (options?.shopkeeper) {
    const email = normaliseEmail(options.shopkeeper.email);
    logins.set(email, {
      id: "shopkeeper",
      email,
      password: options.shopkeeper.password,
      verified: true,
      shopkeeper: true,
    });
  }
  for (const member of options?.members ? options.members : []) {
    const email = normaliseEmail(member.email);
    logins.set(email, {
      id: `member-${logins.size + 1}`,
      email,
      password: member.password,
      verified: member.verified,
      account: { firstName: member.firstName, lastName: member.lastName },
    });
  }
  const sentLinks: SentLink[] = [];
  /** Emailed tokens not used yet; each link works once. */
  const openTokens = new Map<string, string>();

  function sendLink(kind: SentLink["kind"], email: string) {
    const tokenHash = `${kind}:${email}`;
    openTokens.set(tokenHash, email);
    sentLinks.push({ to: email, kind, tokenHash });
  }

  function spendToken(
    kind: SentLink["kind"],
    tokenHash: string,
  ): StoredLogin | undefined {
    const email = openTokens.get(tokenHash);
    if (!email || !tokenHash.startsWith(`${kind}:`)) {
      return undefined;
    }
    openTokens.delete(tokenHash);
    return logins.get(email);
  }

  function loginById(userId: string): StoredLogin | undefined {
    return [...logins.values()].find((login) => login.id === userId);
  }

  return {
    sentLinks,

    async registerCustomer(
      input: RegistrationInput,
    ): Promise<RegistrationOutcome> {
      const email = normaliseEmail(input.email);
      const existing = logins.get(email);
      if (existing?.verified) {
        return "already-registered";
      }
      // Like Supabase: an unverified login keeps its first password and
      // name, and only gets a fresh link.
      if (existing) {
        sendLink("verify-email", email);
        return "verification-sent";
      }
      logins.set(email, {
        id: `member-${logins.size + 1}`,
        email,
        password: input.password,
        verified: false,
        account: { firstName: input.firstName, lastName: input.lastName },
      });
      sendLink("verify-email", email);
      return "verification-sent";
    },

    async verifyEmail(tokenHash) {
      const login = spendToken("verify-email", tokenHash);
      if (!login) {
        return null;
      }
      login.verified = true;
      return login.id;
    },

    async checkPassword(email, password): Promise<PasswordCheck> {
      const login = logins.get(normaliseEmail(email));
      if (!login || login.password !== password) {
        return { ok: false, reason: "invalid-credentials" };
      }
      if (!login.verified) {
        return { ok: false, reason: "email-not-verified" };
      }
      return { ok: true, userId: login.id };
    },

    async sendPasswordReset(email) {
      const login = logins.get(normaliseEmail(email));
      if (login) {
        sendLink("reset-password", login.email);
      }
    },

    async resetPassword(tokenHash, password) {
      const login = spendToken("reset-password", tokenHash);
      if (!login) {
        return false;
      }
      // Opening a recovery link proves the inbox, as in Supabase.
      login.password = password;
      login.verified = true;
      login.passwordChangedAt = clock.now();
      return true;
    },

    async passwordChangedAt(userId) {
      const login = loginById(userId);
      return login?.passwordChangedAt ? login.passwordChangedAt : null;
    },

    async findMember(userId): Promise<Member | null> {
      const login = loginById(userId);
      if (!login?.account) {
        return null;
      }
      return { id: login.id, email: login.email, ...login.account };
    },

    async findShopkeeper(userId): Promise<Shopkeeper | null> {
      const login = loginById(userId);
      return login?.shopkeeper ? { email: login.email } : null;
    },
  };
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}
