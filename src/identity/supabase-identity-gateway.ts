import {
  createClient,
  isAuthApiError,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import type {
  IdentityGateway,
  Member,
  PasswordCheck,
  RegistrationOutcome,
  Shopkeeper,
} from "./types";

/** Where the emailed links land; the email templates append `?token_hash=`. */
export type IdentityLinks = {
  verifyEmailUrl: string;
  resetPasswordUrl: string;
};

type CustomerAccountRow = {
  first_name: string;
  last_name: string;
};

/**
 * Supabase Auth behind the Identity port. Password and link checks run on a
 * fresh client each time: a signed-in client would send later queries as that
 * login instead of the service role. Account rows and admin lookups use the
 * service-role client, which never signs in.
 */
export function createSupabaseIdentityGateway({
  url,
  serviceRoleKey,
  links,
}: {
  url: string;
  serviceRoleKey: string;
  links: IdentityLinks;
}): IdentityGateway {
  const options = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  };
  const admin = createClient(url, serviceRoleKey, options);
  const authFlow = (): SupabaseClient =>
    createClient(url, serviceRoleKey, options);

  async function loginOf(userId: string): Promise<User | null> {
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error) {
      if (isAuthApiError(error) && error.status === 404) {
        return null;
      }
      throw error;
    }
    return data.user;
  }

  async function emailOf(userId: string): Promise<string | null> {
    const login = await loginOf(userId);
    return login?.email ? login.email : null;
  }

  /** Verifies an emailed link; null when it is unknown, used, or expired. */
  async function userFromLink(
    tokenHash: string,
    type: "email" | "recovery",
  ): Promise<string | null> {
    if (tokenHash === "") {
      return null;
    }
    const { data, error } = await authFlow().auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      if (isAuthApiError(error) && error.status < 500) {
        return null;
      }
      throw error;
    }
    return data.user ? data.user.id : null;
  }

  return {
    async registerCustomer(input): Promise<RegistrationOutcome> {
      const { data, error } = await authFlow().auth.signUp({
        email: input.email,
        password: input.password,
        options: { emailRedirectTo: links.verifyEmailUrl },
      });
      if (error) {
        if (error.code === "user_already_exists") {
          return "already-registered";
        }
        throw error;
      }

      // Supabase answers an already-verified email with a user that has no
      // identities and sends nothing; that login keeps whatever it had.
      const user = data.user;
      if (!user?.identities || user.identities.length === 0) {
        return "already-registered";
      }

      // An email still awaiting verification only gets a fresh link: Supabase
      // keeps its first password, and the first name stays too.
      const { error: accountError } = await admin
        .from("customer_accounts")
        .upsert(
          {
            user_id: user.id,
            first_name: input.firstName,
            last_name: input.lastName,
          },
          { onConflict: "user_id", ignoreDuplicates: true },
        );
      if (accountError) {
        throw accountError;
      }
      return "verification-sent";
    },

    async verifyEmail(tokenHash) {
      return userFromLink(tokenHash, "email");
    },

    async checkPassword(email, password): Promise<PasswordCheck> {
      const { data, error } = await authFlow().auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.code === "invalid_credentials") {
          return { ok: false, reason: "invalid-credentials" };
        }
        if (error.code === "email_not_confirmed") {
          return { ok: false, reason: "email-not-verified" };
        }
        throw error;
      }
      return { ok: true, userId: data.user.id };
    },

    async sendPasswordReset(email) {
      const { error } = await authFlow().auth.resetPasswordForEmail(email, {
        redirectTo: links.resetPasswordUrl,
      });
      if (error) {
        throw error;
      }
    },

    async resetPassword(tokenHash, password) {
      const userId = await userFromLink(tokenHash, "recovery");
      if (!userId) {
        return false;
      }
      const { error } = await admin.auth.admin.updateUserById(userId, {
        password,
        app_metadata: { password_changed_at: new Date().toISOString() },
      });
      if (error) {
        throw error;
      }
      return true;
    },

    async passwordChangedAt(userId) {
      const login = await loginOf(userId);
      const changedAt = login?.app_metadata.password_changed_at;
      return typeof changedAt === "string" ? new Date(changedAt) : null;
    },

    async findMember(userId): Promise<Member | null> {
      const { data, error } = await admin
        .from("customer_accounts")
        .select("first_name, last_name")
        .eq("user_id", userId)
        .maybeSingle<CustomerAccountRow>();
      if (error) {
        throw error;
      }
      if (!data) {
        return null;
      }
      const email = await emailOf(userId);
      if (!email) {
        return null;
      }
      return {
        id: userId,
        firstName: data.first_name,
        lastName: data.last_name,
        email,
      };
    },

    async findShopkeeper(userId): Promise<Shopkeeper | null> {
      const { data, error } = await admin
        .from("shopkeepers")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        throw error;
      }
      if (!data) {
        return null;
      }
      const email = await emailOf(userId);
      return email ? { email } : null;
    },
  };
}
