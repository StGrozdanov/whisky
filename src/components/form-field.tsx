type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
  multiline?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  maxLength?: number;
};

const INPUT_CLASS =
  "w-full rounded-lg border bg-surface-container-low px-space-sm py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none";

/** Labelled input whose error is announced and linked via aria-describedby. */
export function FormField({
  id,
  name,
  label,
  type = "text",
  required = false,
  multiline = false,
  autoComplete,
  defaultValue,
  error,
  maxLength,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const className = `${INPUT_CLASS} ${error ? "border-error" : "border-outline-variant/40"}`;
  const shared = {
    id,
    name,
    autoComplete,
    defaultValue,
    maxLength,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className,
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-label-md text-on-surface-variant" htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-primary">
            *
          </span>
        ) : (
          <span className="ml-1 font-normal normal-case text-outline">
            (по желание)
          </span>
        )}
      </label>
      {multiline ? (
        <textarea {...shared} rows={6} />
      ) : (
        <input {...shared} type={type} />
      )}
      {error ? (
        <p className="text-body-sm text-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
