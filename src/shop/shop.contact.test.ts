import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createInMemoryMailer } from "./mailer";
import { createShop } from "./shop";

const NOW = new Date("2026-10-31T10:00:00.000Z");

describe("Shop Contact requests", () => {
  it("records a Contact request with its received time and optional phone", async () => {
    const store = createInMemoryHomeStore();
    const shop = createShop({ store, clock: { now: () => NOW } });

    await shop.submitContactRequest({
      name: "Мария Иванова",
      email: "Maria@Example.com ",
      phone: undefined,
      subject: "Дегустация",
      message: "Организирате ли дегустации в София?",
    });

    expect(store.contactRequests()).toEqual([
      {
        name: "Мария Иванова",
        email: "maria@example.com",
        phone: undefined,
        subject: "Дегустация",
        message: "Организирате ли дегустации в София?",
        receivedAt: NOW,
      },
    ]);
  });

  it("does not email the Customer a confirmation", async () => {
    const mailer = createInMemoryMailer();
    const shop = createShop({
      store: createInMemoryHomeStore(),
      mailer,
      clock: { now: () => NOW },
    });

    await shop.submitContactRequest({
      name: "Мария Иванова",
      email: "maria@example.com",
      phone: "0888123456",
      subject: "Въпрос",
      message: "Здравейте!",
    });

    expect(mailer.sent).toEqual([]);
  });
});
