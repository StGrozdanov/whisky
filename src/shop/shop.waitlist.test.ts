import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createInMemoryMailer } from "./mailer";
import { createShop } from "./shop";

const NOW = new Date("2026-10-31T10:00:00.000Z");
const GLEN_700 = { kind: "sku", skuId: "glen-700" } as const;
const SAMPLER = { kind: "pack", packId: "sampler" } as const;

function waitlistStore(options?: {
  quantity?: number;
  published?: boolean;
  packQuantity?: number;
}) {
  return createInMemoryHomeStore({
    whiskies: [
      {
        id: "glen",
        name: "GlenAllachie 12",
        photoUrl: "/bottles/glenallachie-12.svg",
        origin: "Scotch",
        published: options?.published,
      },
    ],
    primarySkus: [
      {
        id: "glen-700",
        whiskyId: "glen",
        priceEur: 55.2,
        quantity: options?.quantity !== undefined ? options.quantity : 0,
      },
    ],
    discoveryPacks: [
      {
        id: "sampler",
        title: "Шери срещу Торф",
        photoUrl: "/bottles/glenallachie-12.svg",
        priceEur: 21.5,
        quantity:
          options?.packQuantity !== undefined ? options.packQuantity : 0,
        sortOrder: 1,
        lineup: [],
      },
    ],
  });
}

describe("Shop Waitlist (Ask us)", () => {
  it("adds a Waitlist entry with required email and optional phone", async () => {
    const store = waitlistStore();
    const shop = createShop({ store, clock: { now: () => NOW } });

    const outcome = await shop.joinWaitlist({
      target: GLEN_700,
      email: " Guest@Example.com ",
      phone: undefined,
    });

    expect(outcome).toBe("joined");
    expect(await store.waitlistEntries(GLEN_700)).toEqual([
      {
        id: expect.any(String),
        target: GLEN_700,
        email: "guest@example.com",
        phone: undefined,
        createdAt: NOW,
      },
    ]);
  });

  it("keeps one entry per email and SKU", async () => {
    const store = waitlistStore();
    const shop = createShop({ store });

    await shop.joinWaitlist({
      target: GLEN_700,
      email: "guest@example.com",
      phone: "0888123456",
    });
    const second = await shop.joinWaitlist({
      target: GLEN_700,
      email: "GUEST@example.com",
      phone: undefined,
    });

    expect(second).toBe("already-joined");
    expect(await store.waitlistEntries(GLEN_700)).toHaveLength(1);
  });

  it("only accepts SKUs that are not In stock", async () => {
    const store = waitlistStore({ quantity: 2 });
    const shop = createShop({ store });

    const outcome = await shop.joinWaitlist({
      target: GLEN_700,
      email: "guest@example.com",
      phone: undefined,
    });

    expect(outcome).toBe("sku-in-stock");
    expect(await store.waitlistEntries(GLEN_700)).toEqual([]);
  });

  it("rejects unknown SKUs and SKUs of draft Whiskies", async () => {
    const shop = createShop({ store: waitlistStore({ published: false }) });

    expect(
      await shop.joinWaitlist({
        target: { kind: "sku", skuId: "missing" },
        email: "guest@example.com",
        phone: undefined,
      }),
    ).toBe("sku-not-found");
    expect(
      await shop.joinWaitlist({
        target: GLEN_700,
        email: "guest@example.com",
        phone: undefined,
      }),
    ).toBe("sku-not-found");
  });

  it("never emails anyone when someone joins", async () => {
    const mailer = createInMemoryMailer();
    const shop = createShop({ store: waitlistStore(), mailer });

    await shop.joinWaitlist({
      target: GLEN_700,
      email: "guest@example.com",
      phone: undefined,
    });

    expect(mailer.sent).toEqual([]);
  });
});

describe("Shop Waitlist notification on restock", () => {
  async function storeWithEntries(quantity: number) {
    const store = waitlistStore();
    const shop = createShop({ store });
    for (const email of ["a@example.com", "b@example.com"]) {
      await shop.joinWaitlist({ target: GLEN_700, email, phone: undefined });
    }
    store.setSkuQuantity("glen-700", quantity);
    return store;
  }

  it("sends one email per entry and clears the Waitlist", async () => {
    const store = await storeWithEntries(3);
    const mailer = createInMemoryMailer();
    const shop = createShop({
      store,
      mailer,
      siteUrl: "https://whiskyfinder.bg",
    });

    const result = await shop.notifyRestockedWaitlist(GLEN_700);

    expect(result).toEqual({ status: "notified", sent: 2, failed: 0 });
    expect(mailer.sent.map((email) => email.to)).toEqual([
      "a@example.com",
      "b@example.com",
    ]);
    expect(mailer.sent[0].subject).toContain("GlenAllachie 12");
    expect(mailer.sent[0].text).toContain(
      "https://whiskyfinder.bg/whiskies/glen",
    );
    expect(mailer.sent[0].text).toContain("не е резервация");
    expect(await store.waitlistEntries(GLEN_700)).toEqual([]);
  });

  it("keeps entries whose email failed so a later run can retry them", async () => {
    const store = await storeWithEntries(3);
    const mailer = createInMemoryMailer({ failFor: ["b@example.com"] });
    const shop = createShop({ store, mailer });

    const result = await shop.notifyRestockedWaitlist(GLEN_700);

    expect(result).toEqual({ status: "notified", sent: 1, failed: 1 });
    const remaining = await store.waitlistEntries(GLEN_700);
    expect(remaining.map((entry) => entry.email)).toEqual(["b@example.com"]);
  });

  it("does nothing while the SKU is still not In stock", async () => {
    const store = await storeWithEntries(0);
    const mailer = createInMemoryMailer();
    const shop = createShop({ store, mailer });

    const result = await shop.notifyRestockedWaitlist(GLEN_700);

    expect(result).toEqual({ status: "sku-not-in-stock" });
    expect(mailer.sent).toEqual([]);
    expect(await store.waitlistEntries(GLEN_700)).toHaveLength(2);
  });

  it("reports an unknown SKU", async () => {
    const shop = createShop({
      store: waitlistStore(),
      mailer: createInMemoryMailer(),
    });

    expect(
      await shop.notifyRestockedWaitlist({ kind: "sku", skuId: "missing" }),
    ).toEqual({
      status: "sku-not-found",
    });
  });
});

describe("Shop Waitlist for Packs", () => {
  it("adds a Waitlist entry for a Pack that is not In stock", async () => {
    const store = waitlistStore();
    const shop = createShop({ store, clock: { now: () => NOW } });

    const outcome = await shop.joinWaitlist({
      target: SAMPLER,
      email: "Guest@Example.com",
      phone: "0888123456",
    });

    expect(outcome).toBe("joined");
    expect(await store.waitlistEntries(SAMPLER)).toEqual([
      {
        id: expect.any(String),
        target: SAMPLER,
        email: "guest@example.com",
        phone: "0888123456",
        createdAt: NOW,
      },
    ]);
  });

  it("keeps one entry per email and Pack, separate from Whisky SKUs", async () => {
    const store = waitlistStore();
    const shop = createShop({ store });
    const join = (target: typeof GLEN_700 | typeof SAMPLER) =>
      shop.joinWaitlist({
        target,
        email: "guest@example.com",
        phone: undefined,
      });

    expect(await join(SAMPLER)).toBe("joined");
    expect(await join(SAMPLER)).toBe("already-joined");
    expect(await join(GLEN_700)).toBe("joined");
    expect(await store.waitlistEntries(SAMPLER)).toHaveLength(1);
    expect(await store.waitlistEntries(GLEN_700)).toHaveLength(1);
  });

  it("only accepts known Packs that are not In stock", async () => {
    const shop = createShop({ store: waitlistStore({ packQuantity: 3 }) });

    expect(
      await shop.joinWaitlist({
        target: SAMPLER,
        email: "guest@example.com",
        phone: undefined,
      }),
    ).toBe("sku-in-stock");
    expect(
      await shop.joinWaitlist({
        target: { kind: "pack", packId: "missing" },
        email: "guest@example.com",
        phone: undefined,
      }),
    ).toBe("sku-not-found");
  });

  it("emails each entry once when the Pack is restocked and clears them", async () => {
    const store = waitlistStore();
    const shop = createShop({ store });
    for (const email of ["a@example.com", "b@example.com"]) {
      await shop.joinWaitlist({ target: SAMPLER, email, phone: undefined });
    }
    store.setPackQuantity("sampler", 2);
    const mailer = createInMemoryMailer();
    const notifier = createShop({
      store,
      mailer,
      siteUrl: "https://whiskyfinder.bg",
    });

    const result = await notifier.notifyRestockedWaitlist(SAMPLER);

    expect(result).toEqual({ status: "notified", sent: 2, failed: 0 });
    expect(mailer.sent[0].subject).toContain("Шери срещу Торф");
    expect(mailer.sent[0].text).toContain("https://whiskyfinder.bg/packs");
    expect(mailer.sent[0].text).toContain("не е резервация");
    expect(await store.waitlistEntries(SAMPLER)).toEqual([]);
  });
});
