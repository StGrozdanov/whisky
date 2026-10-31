import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop } from "./shop";

const SUBSCRIBED_AT = new Date("2026-10-31T10:00:00.000Z");
const SITE_URL = "https://whiskyfinder.bg";

function unsubscribeToken(url: string): string {
  const token = new URL(url).searchParams.get("token");
  if (!token) {
    throw new Error(`No unsubscribe token in ${url}`);
  }
  return token;
}

describe("Shop Newsletter subscription", () => {
  it("subscribes immediately and records consent evidence", async () => {
    const store = createInMemoryHomeStore();
    const shop = createShop({
      store,
      clock: { now: () => SUBSCRIBED_AT },
      siteUrl: SITE_URL,
    });

    await shop.subscribeToNewsletter({
      email: " Ivan@Example.com",
      policyVersion: "2026-10-31",
    });

    const [subscription] = await store.newsletterSubscriptions();
    expect(subscription).toMatchObject({
      email: "ivan@example.com",
      consentedAt: SUBSCRIBED_AT,
      policyVersion: "2026-10-31",
    });

    const recipients = await shop.newsletterRecipients();
    expect(recipients).toHaveLength(1);
    expect(recipients[0].email).toBe("ivan@example.com");
    expect(recipients[0].unsubscribeUrl).toMatch(
      /^https:\/\/whiskyfinder\.bg\/newsletter\/unsubscribe\?token=.+/,
    );
  });

  it("keeps one subscription per email and refreshes its consent evidence", async () => {
    let now = SUBSCRIBED_AT;
    const store = createInMemoryHomeStore();
    const shop = createShop({ store, clock: { now: () => now } });

    await shop.subscribeToNewsletter({
      email: "ivan@example.com",
      policyVersion: "2026-10-31",
    });
    now = new Date("2026-11-05T09:00:00.000Z");
    await shop.subscribeToNewsletter({
      email: "IVAN@example.com",
      policyVersion: "2026-11-01",
    });

    const subscriptions = await store.newsletterSubscriptions();
    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0]).toMatchObject({
      consentedAt: now,
      policyVersion: "2026-11-01",
    });
  });

  it("unsubscribes by token, keeping only the email on the suppression list", async () => {
    const unsubscribedAt = new Date("2026-11-10T08:00:00.000Z");
    let now = SUBSCRIBED_AT;
    const store = createInMemoryHomeStore();
    const shop = createShop({ store, clock: { now: () => now } });
    await shop.subscribeToNewsletter({
      email: "ivan@example.com",
      policyVersion: "2026-10-31",
    });
    const [recipient] = await shop.newsletterRecipients();

    now = unsubscribedAt;
    const outcome = await shop.unsubscribeFromNewsletter(
      unsubscribeToken(recipient.unsubscribeUrl),
    );

    expect(outcome).toBe("unsubscribed");
    expect(await shop.newsletterRecipients()).toEqual([]);
    expect(await store.newsletterSubscriptions()).toEqual([]);
    expect(await store.newsletterSuppressions()).toEqual([
      { email: "ivan@example.com", suppressedAt: unsubscribedAt },
    ]);
  });

  it("reports an unknown or already used unsubscribe token", async () => {
    const shop = createShop({ store: createInMemoryHomeStore() });
    await shop.subscribeToNewsletter({
      email: "ivan@example.com",
      policyVersion: "2026-10-31",
    });
    const [recipient] = await shop.newsletterRecipients();
    const token = unsubscribeToken(recipient.unsubscribeUrl);

    expect(await shop.unsubscribeFromNewsletter("not-a-token")).toBe(
      "unknown-token",
    );
    expect(await shop.unsubscribeFromNewsletter(token)).toBe("unsubscribed");
    expect(await shop.unsubscribeFromNewsletter(token)).toBe("unknown-token");
  });

  it("never lists a suppressed email as a recipient", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        newsletterSubscriptions: [
          {
            email: "kept@example.com",
            consentedAt: SUBSCRIBED_AT,
            policyVersion: "2026-10-31",
            unsubscribeToken: "kept-token",
          },
          {
            email: "suppressed@example.com",
            consentedAt: SUBSCRIBED_AT,
            policyVersion: "2026-10-31",
            unsubscribeToken: "suppressed-token",
          },
        ],
        newsletterSuppressions: [
          { email: "suppressed@example.com", suppressedAt: SUBSCRIBED_AT },
        ],
      }),
    });

    const recipients = await shop.newsletterRecipients();

    expect(recipients.map((recipient) => recipient.email)).toEqual([
      "kept@example.com",
    ]);
  });

  it("treats a fresh subscription after unsubscribe as new consent", async () => {
    const resubscribedAt = new Date("2026-12-01T10:00:00.000Z");
    let now = SUBSCRIBED_AT;
    const store = createInMemoryHomeStore();
    const shop = createShop({ store, clock: { now: () => now } });
    await shop.subscribeToNewsletter({
      email: "ivan@example.com",
      policyVersion: "2026-10-31",
    });
    const [recipient] = await shop.newsletterRecipients();
    await shop.unsubscribeFromNewsletter(
      unsubscribeToken(recipient.unsubscribeUrl),
    );

    now = resubscribedAt;
    await shop.subscribeToNewsletter({
      email: "ivan@example.com",
      policyVersion: "2026-10-31",
    });

    expect(await store.newsletterSuppressions()).toEqual([]);
    const recipients = await shop.newsletterRecipients();
    expect(recipients.map((entry) => entry.email)).toEqual([
      "ivan@example.com",
    ]);
    expect(recipients[0].unsubscribeUrl).not.toBe(recipient.unsubscribeUrl);
    const [subscription] = await store.newsletterSubscriptions();
    expect(subscription.consentedAt).toEqual(resubscribedAt);
  });
});
