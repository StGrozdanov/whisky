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

    const outcome = await shop.subscribeToNewsletter({
      email: " Ivan@Example.com",
      policyVersion: "2026-10-31",
    });

    expect(outcome).toBe("subscribed");
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

  it("keeps the first consent evidence and unsubscribe link when the same email subscribes again", async () => {
    let now = SUBSCRIBED_AT;
    const store = createInMemoryHomeStore();
    const shop = createShop({ store, clock: { now: () => now } });

    await shop.subscribeToNewsletter({
      email: "ivan@example.com",
      policyVersion: "2026-10-31",
    });
    const [sentRecipient] = await shop.newsletterRecipients();
    now = new Date("2026-11-05T09:00:00.000Z");
    const outcome = await shop.subscribeToNewsletter({
      email: "IVAN@example.com",
      policyVersion: "2026-11-01",
    });

    expect(outcome).toBe("already-subscribed");
    const subscriptions = await store.newsletterSubscriptions();
    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0]).toMatchObject({
      consentedAt: SUBSCRIBED_AT,
      policyVersion: "2026-10-31",
    });
    expect(await shop.newsletterRecipients()).toEqual([sentRecipient]);
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

  it("keeps an unsubscribed email on the suppression list when it subscribes again", async () => {
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
    await shop.unsubscribeFromNewsletter(
      unsubscribeToken(recipient.unsubscribeUrl),
    );

    now = new Date("2026-12-01T10:00:00.000Z");
    const outcome = await shop.subscribeToNewsletter({
      email: " Ivan@Example.com",
      policyVersion: "2026-10-31",
    });

    expect(outcome).toBe("suppressed");
    expect(await store.newsletterSubscriptions()).toEqual([]);
    expect(await shop.newsletterRecipients()).toEqual([]);
    expect(await store.newsletterSuppressions()).toEqual([
      { email: "ivan@example.com", suppressedAt: unsubscribedAt },
    ]);
  });
});
