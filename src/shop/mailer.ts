/**
 * Outbound email port. The Shop sends Waitlist notifications through it.
 * No email provider is wired yet: production uses the unconfigured mailer,
 * which fails every send so callers keep their pending work for a retry.
 */
export type OutboundEmail = {
  to: string;
  subject: string;
  text: string;
};

export type Mailer = {
  send(email: OutboundEmail): Promise<void>;
};

export function createInMemoryMailer(options?: {
  failFor?: string[];
}): Mailer & { sent: OutboundEmail[] } {
  const sent: OutboundEmail[] = [];
  const failFor = new Set(options?.failFor ? options.failFor : []);

  return {
    sent,
    async send(email) {
      if (failFor.has(email.to)) {
        throw new Error(`In-memory mailer refused ${email.to}`);
      }
      sent.push(email);
    },
  };
}

export function createUnconfiguredMailer(): Mailer {
  return {
    async send() {
      throw new Error("No email provider is configured for Whisky Finder");
    },
  };
}
