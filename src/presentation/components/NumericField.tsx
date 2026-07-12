interface NumericFieldProps {
  label: string;
  value: number;
  step?: number;
  min?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

export default function NumericField({
  label,
  value,
  step = 0.1,
  min = 0,
  readOnly = false,
  onChange,
}: NumericFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        readOnly={readOnly}
        onChange={(event) => onChange?.(Number(event.target.value))}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
          readOnly ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-white border-gray-300'
        }`}
      />
    </div>
  );
}
