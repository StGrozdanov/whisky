import { createHmac, timingSafeEqual } from "node:crypto";
import type { Clock } from "@/shop/types";
import type {
  IdentityGateway,
  Member,
  RegistrationInput,
  Shopkeeper,
} from "./types";

export type SignInResult =
  | { ok: true; session: string }
  | { ok: false; reason: "invalid-credentials" | "email-not-verified" };

export type LinkResult =
  | { ok: true; session: string }
  | { ok: false; reason: "invalid-link" };

export type Identity = ReturnType<typeof createIdentity>;

type SessionKind = "member" | "shopkeeper";

type SessionPayload = {
  sub: string;
  kind: SessionKind;
  /** Issued at, in milliseconds: a later password reset ends the session. */
  iat: number;
  exp: number;
};

export const SESSION_SECONDS: Record<SessionKind, number> = {
  member: 30 * 24 * 60 * 60,
  shopkeeper: 12 * 60 * 60,
};

const wallClock: Clock = {
  now: () => new Date(),
};

type IdentityDependencies = {
  gateway: IdentityGateway;
  sessionSecret: string;
  clock?: Clock;
};

/**
 * Customer Accounts and Shopkeeper access. Customers and the Shopkeeper sign
 * in through separate doors and hold separate sessions; neither opens the
 * other's. A session is a signed token naming the login and its kind; the
 * caller keeps it in an httpOnly cookie.
 */
export function createIdentity({
  gateway,
  sessionSecret,
  clock: injectedClock,
}: IdentityDependencies) {
  const clock = injectedClock ? injectedClock : wallClock;

  function nowInSeconds(): number {
    return Math.floor(clock.now().getTime() / 1000);
  }

  function sign(encodedPayload: string): string {
    return createHmac("sha256", sessionSecret)
      .update(encodedPayload)
      .digest("base64url");
  }

  function issueSession(userId: string, kind: SessionKind): string {
    const payload: SessionPayload = {
      sub: userId,
      kind,
      iat: clock.now().getTime(),
      exp: nowInSeconds() + SESSION_SECONDS[kind],
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${encoded}.${sign(encoded)}`;
  }

  /** The login a session names, if it is genuine, current, and of this kind. */
  async function readSession(
    token: string | undefined,
    kind: SessionKind,
  ): Promise<string | null> {
    const [encoded, signature] = token ? token.split(".") : [];
    if (!encoded || !signature) {
      return null;
    }
    const expected = Buffer.from(sign(encoded));
    const actual = Buffer.from(signature);
    if (
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      return null;
    }
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString(),
    ) as SessionPayload;
    if (payload.kind !== kind || payload.exp < nowInSeconds()) {
      return null;
    }
    const changedAt = await gateway.passwordChangedAt(payload.sub);
    if (changedAt && changedAt.getTime() > payload.iat) {
      return null;
    }
    return payload.sub;
  }

  return {
    async register(input: RegistrationInput): Promise<void> {
      await gateway.registerCustomer(input);
    },

    async verifyEmail(tokenHash: string): Promise<LinkResult> {
      const userId = await gateway.verifyEmail(tokenHash);
      if (!userId) {
        return { ok: false, reason: "invalid-link" };
      }
      return { ok: true, session: issueSession(userId, "member") };
    },

    async signInMember(email: string, password: string): Promise<SignInResult> {
      const check = await gateway.checkPassword(email, password);
      if (!check.ok) {
        return check;
      }
      if (!(await gateway.findMember(check.userId))) {
        return { ok: false, reason: "invalid-credentials" };
      }
      return { ok: true, session: issueSession(check.userId, "member") };
    },

    async signInShopkeeper(
      email: string,
      password: string,
    ): Promise<SignInResult> {
      const check = await gateway.checkPassword(email, password);
      if (!check.ok || !(await gateway.findShopkeeper(check.userId))) {
        return { ok: false, reason: "invalid-credentials" };
      }
      return { ok: true, session: issueSession(check.userId, "shopkeeper") };
    },

    async requestPasswordReset(email: string): Promise<void> {
      await gateway.sendPasswordReset(email);
    },

    async resetPassword(
      tokenHash: string,
      password: string,
    ): Promise<"password-changed" | "invalid-link"> {
      const changed = await gateway.resetPassword(tokenHash, password);
      return changed ? "password-changed" : "invalid-link";
    },

    async memberFromSession(token: string | undefined): Promise<Member | null> {
      const userId = await readSession(token, "member");
      return userId ? gateway.findMember(userId) : null;
    },

    async shopkeeperFromSession(
      token: string | undefined,
    ): Promise<Shopkeeper | null> {
      const userId = await readSession(token, "shopkeeper");
      return userId ? gateway.findShopkeeper(userId) : null;
    },
  };
}
