import { Icon } from "@/components/icon";

type FormStatusProps = {
  tone: "success" | "error";
  message: string;
};

/** Form-level outcome, announced to assistive technology when it appears. */
export function FormStatus({ tone, message }: FormStatusProps) {
  if (tone === "success") {
    return (
      <p
        className="flex items-start gap-2 rounded-lg bg-surface-container px-space-sm py-space-sm text-body-sm text-on-surface"
        role="status"
      >
        <Icon className="text-secondary" fontSize={18} name="verified" />
        <span>{message}</span>
      </p>
    );
  }

  return (
    <p
      className="flex items-start gap-2 rounded-lg border border-error/40 bg-surface-container px-space-sm py-space-sm text-body-sm text-error"
      role="alert"
    >
      <Icon fontSize={18} name="cloud_off" />
      <span>{message}</span>
    </p>
  );
}
