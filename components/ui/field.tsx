import { cn } from "@/lib/utils";

export function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
    >
      {children} {optional ? <span className="font-normal muted-copy">(optional)</span> : null}
    </label>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }
) {
  return <input {...props} className={cn("input-shell", props.className)} />;
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    className?: string;
  }
) {
  return <textarea {...props} className={cn("input-shell min-h-32", props.className)} />;
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string }
) {
  return <select {...props} className={cn("input-shell", props.className)} />;
}
