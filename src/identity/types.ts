/** What a Customer submits to create an Account. */
export type RegistrationInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

/** A signed-in Customer with an Account. */
export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

/** The one person signed into the back office. */
export type Shopkeeper = {
  email: string;
};

export type PasswordCheck =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid-credentials" | "email-not-verified" };

/**
 * Port onto the email-and-password auth provider (Supabase Auth in
 * production). It owns credentials, verification and recovery links; the
 * Identity module owns which kind of person may sign in where, and sessions.
 */
export type IdentityGateway = {
  /**
   * Creates an unverified Customer Account and sends its verification link.
   * Registering an unverified email again takes the new name and password and
   * sends a fresh link. A verified login is left untouched without an error,
   * so registration never reveals who has an Account.
   */
  registerCustomer(input: RegistrationInput): Promise<void>;
  /** Marks the email verified; returns the login id, or null for a bad link. */
  verifyEmail(tokenHash: string): Promise<string | null>;
  checkPassword(email: string, password: string): Promise<PasswordCheck>;
  /** Emails a recovery link; an email without a login is silently ignored. */
  sendPasswordReset(email: string): Promise<void>;
  /** Sets a new password from a recovery link; false for a bad link. */
  resetPassword(tokenHash: string, password: string): Promise<boolean>;
  /** When the login last reset its password, or null if it never has. */
  passwordChangedAt(userId: string): Promise<Date | null>;
  /** The Customer Account for a login, or null when it has none. */
  findMember(userId: string): Promise<Member | null>;
  /** The Shopkeeper, when this login is theirs; otherwise null. */
  findShopkeeper(userId: string): Promise<Shopkeeper | null>;
};
