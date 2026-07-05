interface TextareaFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export default function TextareaField({
  label,
  value,
  placeholder,
  rows = 3,
  readOnly = false,
  onChange,
}: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
          readOnly ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-white border-gray-300'
        }`}
      />
    </div>
  );
}
