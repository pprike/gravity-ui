interface FormSectionProps {
  title: string;
  description?: string;
}

export function FormSection({ title, description }: FormSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}

export function FormDivider() {
  return <hr className="border-slate-200" />;
}
