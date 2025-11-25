import { Check } from "lucide-react";

export default function CheckButton({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
        checked
          ? 'bg-sky-500 border-sky-500 text-white'
          : 'bg-white border-gray-300 hover:border-sky-400'
      }`}
    >
      <Check
        size={14}
        className={`transition-transform duration-200 ${
          checked ? 'scale-100' : 'scale-0'
        }`}
        strokeWidth={3}
      />
    </button>
  )
}