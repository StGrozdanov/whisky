type SubmitButtonProps = {
  pending: boolean;
  label: string;
  pendingLabel: string;
};

export function SubmitButton({
  pending,
  label,
  pendingLabel,
}: SubmitButtonProps) {
  return (
    <button
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-space-xl py-3 text-label-md font-bold tracking-wider text-on-primary uppercase shadow-sm transition-colors hover:bg-primary-fixed disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:self-start"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
