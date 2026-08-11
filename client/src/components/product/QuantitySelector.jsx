export default function QuantitySelector({ value, max = 99, onChange, small = false }) {
  return (
    <div
      className={`inline-flex items-center rounded-xl border border-slate-300 ${
        small ? 'h-8' : 'h-10'
      }`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="flex h-full w-8 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        aria-label="decrease"
      >
        −
      </button>
      <span className={`w-8 text-center font-bold text-slate-800 ${small ? 'text-sm' : 'text-base'}`}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-full w-8 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        aria-label="increase"
      >
        +
      </button>
    </div>
  );
}
