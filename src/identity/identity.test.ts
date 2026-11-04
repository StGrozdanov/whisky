import { describe, expect, it } from "vitest";
import { createIdentity } from "./identity";
import { createInMemoryIdentityGateway } from "./in-memory-identity-gateway";

const SESSION_SECRET = "unit-test-session-secret";

const MARIA = {
  firstName: "Мария",
  lastName: "Иванова",
  email: "maria@example.com",
  password: "dalmore-12-years",
};

const SHOPKEEPER = {
  email: "shopkeeper@example.com",
  password: "back-office-password",
};

function setup(options?: { now?: () => Date }) {
  const clock = { now: options?.now ? options.now : () => new Date() };
  const gateway = createInMemoryIdentityGateway({
    shopkeeper: SHOPKEEPER,
    clock,
  });
  const identity = createIdentity({
    gateway,
    sessionSecret: SESSION_SECRET,
    clock,
  });
  return { gateway, identity };
}

async function verifiedMemberSession(
  identity: ReturnType<typeof setup>["identity"],
  gateway: ReturnType<typeof setup>["gateway"],
): Promise<string> {
  await identity.register(MARIA);
  const verified = await identity.verifyEmail({
    tokenHash: gateway.sentLinks[0].tokenHash,
    email: MARIA.email,
    password: MARIA.password,
  });
  if (!verified.ok) {
    throw new Error("Expected the verification link to work");
  }
  return verified.session;
}

describe("Identity Customer Accounts", () => {
  it("keeps a new Account unable to sign in until its email is verified", async () => {
    const { identity } = setup();

    await identity.register(MARIA);

    expect(await identity.signInMember(MARIA.email, MARIA.password)).toEqual({
      ok: false,
      reason: "email-not-verified",
    });
  });

  it("signs the Member in from the emailed link and their password", async () => {
    const { gateway, identity } = setup();
    await identity.register(MARIA);
    const [link] = gateway.sentLinks;

    const verified = await identity.verifyEmail({
      tokenHash: link.tokenHash,
      email: "Maria@Example.com",
      password: MARIA.password,
    });

    expect(link).toMatchObject({ to: MARIA.email, kind: "verify-email" });
    expect(verified.ok).toBe(true);
    expect(
      await identity.memberFromSession(verified.ok ? verified.session : ""),
    ).toEqual({
      id: expect.any(String),
      firstName: "Мария",
      lastName: "Иванова",
      email: "maria@example.com",
    });
  });

  it("ends a Member session after 30 days", async () => {
    let now = new Date("2026-11-01T10:00:00.000Z");
    const { gateway, identity } = setup({ now: () => now });
    const session = await verifiedMemberSession(identity, gateway);

    now = new Date("2026-11-30T10:00:00.000Z");
    expect(await identity.memberFromSession(session)).not.toBeNull();

    now = new Date("2026-12-01T10:00:01.000Z");
    expect(await identity.memberFromSession(session)).toBeNull();
  });

  it("refuses a session that was not signed by this shop", async () => {
    const { gateway, identity } = setup();
    const session = await verifiedMemberSession(identity, gateway);
    const [payload] = session.split(".");
    const otherShop = createIdentity({
      gateway,
      sessionSecret: "another-secret",
      clock: { now: () => new Date() },
    });

    expect(await identity.memberFromSession(`${payload}.forged`)).toBeNull();
    expect(await otherShop.memberFromSession(session)).toBeNull();
    expect(await identity.memberFromSession("not-a-session")).toBeNull();
    expect(await identity.memberFromSession(undefined)).toBeNull();
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    const { gateway, identity } = setup();
    await verifiedMemberSession(identity, gateway);

    expect(await identity.signInMember(MARIA.email, "wrong-password")).toEqual({
      ok: false,
      reason: "invalid-credentials",
    });
    expect(
      await identity.signInMember("nobody@example.com", MARIA.password),
    ).toEqual({ ok: false, reason: "invalid-credentials" });
  });

  it("accepts each verification link once", async () => {
    const { gateway, identity } = setup();
    await identity.register(MARIA);
    const [link] = gateway.sentLinks;

    const credentials = { email: MARIA.email, password: MARIA.password };

    expect(
      (
        await identity.verifyEmail({
          tokenHash: link.tokenHash,
          ...credentials,
        })
      ).ok,
    ).toBe(true);
    expect(
      await identity.verifyEmail({ tokenHash: link.tokenHash, ...credentials }),
    ).toEqual({ ok: false, reason: "invalid-link" });
    expect(
      await identity.verifyEmail({ tokenHash: "made-up", ...credentials }),
    ).toEqual({ ok: false, reason: "invalid-link" });
  });

  it("does not verify the email for someone without the Account's password", async () => {
    const { gateway, identity } = setup();
    await identity.register(MARIA);
    const [link] = gateway.sentLinks;

    expect(
      await identity.verifyEmail({
        tokenHash: link.tokenHash,
        email: MARIA.email,
        password: "a-guess",
      }),
    ).toEqual({ ok: false, reason: "invalid-credentials" });
    expect(await identity.signInMember(MARIA.email, MARIA.password)).toEqual({
      ok: false,
      reason: "email-not-verified",
    });
    expect(
      (
        await identity.verifyEmail({
          tokenHash: link.tokenHash,
          email: MARIA.email,
          password: MARIA.password,
        })
      ).ok,
    ).toBe(true);
  });

  it("keeps the first password and name when an unverified email registers again", async () => {
    const { gateway, identity } = setup();
    const squatter = {
      ...MARIA,
      firstName: "Чужд",
      password: "squatters-password",
    };
    await identity.register(squatter);

    expect(await identity.register(MARIA)).toBe("verification-sent");
    const latest = gateway.sentLinks.at(-1);
    expect(latest).toMatchObject({ to: MARIA.email, kind: "verify-email" });
    expect(
      await identity.verifyEmail({
        tokenHash: latest ? latest.tokenHash : "",
        email: MARIA.email,
        password: MARIA.password,
      }),
    ).toEqual({ ok: false, reason: "invalid-credentials" });
  });

  it("tells a verified email it is already registered and leaves it untouched", async () => {
    const { gateway, identity } = setup();
    await verifiedMemberSession(identity, gateway);

    const outcome = await identity.register({
      ...MARIA,
      firstName: "Друга",
      password: "someone-elses-password",
    });

    expect(outcome).toBe("already-registered");
    const signedIn = await identity.signInMember(MARIA.email, MARIA.password);
    expect(signedIn.ok).toBe(true);
    expect(
      await identity.memberFromSession(signedIn.ok ? signedIn.session : ""),
    ).toMatchObject({ firstName: "Мария" });
  });
});

describe("Identity password recovery", () => {
  it("replaces the password from the emailed recovery link", async () => {
    const { gateway, identity } = setup();
    await verifiedMemberSession(identity, gateway);

    await identity.requestPasswordReset("Maria@Example.com");
    const link = gateway.sentLinks.at(-1);

    expect(link).toMatchObject({ to: MARIA.email, kind: "reset-password" });
    expect(
      await identity.resetPassword(
        link ? link.tokenHash : "",
        "new-password-1",
      ),
    ).toBe("password-changed");
    expect(await identity.signInMember(MARIA.email, MARIA.password)).toEqual({
      ok: false,
      reason: "invalid-credentials",
    });
    expect(
      (await identity.signInMember(MARIA.email, "new-password-1")).ok,
    ).toBe(true);
  });

  it("ends sessions that were signed in before the password changed", async () => {
    let now = new Date("2026-11-01T10:00:00.000Z");
    const { gateway, identity } = setup({ now: () => now });
    const before = await verifiedMemberSession(identity, gateway);

    now = new Date("2026-11-01T11:00:00.000Z");
    await identity.requestPasswordReset(MARIA.email);
    const link = gateway.sentLinks.at(-1);
    await identity.resetPassword(link ? link.tokenHash : "", "new-password-1");
    now = new Date("2026-11-01T11:05:00.000Z");
    const after = await identity.signInMember(MARIA.email, "new-password-1");

    expect(await identity.memberFromSession(before)).toBeNull();
    expect(
      await identity.memberFromSession(after.ok ? after.session : ""),
    ).not.toBeNull();
  });

  it("does not accept a recovery link as an email verification", async () => {
    const { gateway, identity } = setup();
    await identity.register(MARIA);
    await identity.requestPasswordReset(MARIA.email);
    const reset = gateway.sentLinks.find(
      (link) => link.kind === "reset-password",
    );

    expect(
      await identity.verifyEmail({
        tokenHash: reset ? reset.tokenHash : "",
        email: MARIA.email,
        password: MARIA.password,
      }),
    ).toEqual({ ok: false, reason: "invalid-link" });
  });

  it("verifies an unverified email through password recovery", async () => {
    const { gateway, identity } = setup();
    await identity.register(MARIA);
    await identity.requestPasswordReset(MARIA.email);
    const reset = gateway.sentLinks.at(-1);

    await identity.resetPassword(
      reset ? reset.tokenHash : "",
      "new-password-1",
    );

    expect(
      (await identity.signInMember(MARIA.email, "new-password-1")).ok,
    ).toBe(true);
  });

  it("refuses a used or unknown recovery link", async () => {
    const { gateway, identity } = setup();
    await verifiedMemberSession(identity, gateway);
    await identity.requestPasswordReset(MARIA.email);
    const link = gateway.sentLinks.at(-1);
    const tokenHash = link ? link.tokenHash : "";
    await identity.resetPassword(tokenHash, "new-password-1");

    expect(await identity.resetPassword(tokenHash, "new-password-2")).toBe(
      "invalid-link",
    );
    expect(await identity.resetPassword("made-up", "new-password-2")).toBe(
      "invalid-link",
    );
  });

  it("sends nothing for an email without a login and does not say so", async () => {
    const { gateway, identity } = setup();

    await expect(
      identity.requestPasswordReset("nobody@example.com"),
    ).resolves.toBeUndefined();
    expect(gateway.sentLinks).toEqual([]);
  });
});

describe("Identity Shopkeeper access", () => {
  it("lets the Shopkeeper into the back office", async () => {
    const { identity } = setup();

    const signedIn = await identity.signInShopkeeper(
      SHOPKEEPER.email,
      SHOPKEEPER.password,
    );

    expect(signedIn.ok).toBe(true);
    expect(
      await identity.shopkeeperFromSession(signedIn.ok ? signedIn.session : ""),
    ).toEqual({ email: SHOPKEEPER.email });
  });

  it("keeps Members out of the back office", async () => {
    const { gateway, identity } = setup();
    const memberSession = await verifiedMemberSession(identity, gateway);

    expect(
      await identity.signInShopkeeper(MARIA.email, MARIA.password),
    ).toEqual({ ok: false, reason: "invalid-credentials" });
    expect(await identity.shopkeeperFromSession(memberSession)).toBeNull();
  });

  it("does not register the Shopkeeper's email as a Customer Account", async () => {
    const { identity } = setup();

    expect(
      await identity.register({
        ...MARIA,
        email: SHOPKEEPER.email,
        password: "someone-elses-password",
      }),
    ).toBe("already-registered");
    expect(
      (await identity.signInShopkeeper(SHOPKEEPER.email, SHOPKEEPER.password))
        .ok,
    ).toBe(true);
  });

  it("does not give the Shopkeeper a Customer Account", async () => {
    const { identity } = setup();
    const signedIn = await identity.signInShopkeeper(
      SHOPKEEPER.email,
      SHOPKEEPER.password,
    );

    expect(
      await identity.signInMember(SHOPKEEPER.email, SHOPKEEPER.password),
    ).toEqual({ ok: false, reason: "invalid-credentials" });
    expect(
      await identity.memberFromSession(signedIn.ok ? signedIn.session : ""),
    ).toBeNull();
  });

  it("ends a Shopkeeper session after 12 hours", async () => {
    let now = new Date("2026-11-01T08:00:00.000Z");
    const { identity } = setup({ now: () => now });
    const signedIn = await identity.signInShopkeeper(
      SHOPKEEPER.email,
      SHOPKEEPER.password,
    );
    const session = signedIn.ok ? signedIn.session : "";

    now = new Date("2026-11-01T19:59:00.000Z");
    expect(await identity.shopkeeperFromSession(session)).not.toBeNull();

    now = new Date("2026-11-01T20:00:01.000Z");
    expect(await identity.shopkeeperFromSession(session)).toBeNull();
  });
});
