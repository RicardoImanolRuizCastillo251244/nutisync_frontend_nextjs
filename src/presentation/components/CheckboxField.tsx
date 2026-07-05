interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/40"
      />
      <span>{label}</span>
    </label>
  );
}
