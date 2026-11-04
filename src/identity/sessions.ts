import { cookies } from "next/headers";
import { getIdentity } from "./get-identity";
import { SESSION_SECONDS } from "./identity";
import type { Member, Shopkeeper } from "./types";

/**
 * Customer and Shopkeeper sessions live in separate httpOnly cookies. The
 * Shopkeeper cookie is only ever sent to the back office.
 */
const MEMBER_COOKIE = "wf_member_session";
const SHOPKEEPER_COOKIE = "wf_shopkeeper_session";
const SHOPKEEPER_PATH = "/back-office";

export async function currentMember(): Promise<Member | null> {
  const token = (await cookies()).get(MEMBER_COOKIE);
  if (!token) {
    return null;
  }
  const identity = await getIdentity();
  return identity.memberFromSession(token.value);
}

export async function startMemberSession(session: string): Promise<void> {
  (await cookies()).set(MEMBER_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS.member,
  });
}

export async function endMemberSession(): Promise<void> {
  (await cookies()).delete({ name: MEMBER_COOKIE, path: "/" });
}

export async function currentShopkeeper(): Promise<Shopkeeper | null> {
  const token = (await cookies()).get(SHOPKEEPER_COOKIE);
  if (!token) {
    return null;
  }
  const identity = await getIdentity();
  return identity.shopkeeperFromSession(token.value);
}

export async function startShopkeeperSession(session: string): Promise<void> {
  (await cookies()).set(SHOPKEEPER_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: SHOPKEEPER_PATH,
    maxAge: SESSION_SECONDS.shopkeeper,
  });
}

export async function endShopkeeperSession(): Promise<void> {
  (await cookies()).delete({ name: SHOPKEEPER_COOKIE, path: SHOPKEEPER_PATH });
}
