interface TextFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export default function TextField({
  label,
  value,
  placeholder,
  readOnly = false,
  onChange,
}: TextFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
          readOnly ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-white border-gray-300'
        }`}
      />
    </div>
  );
}
