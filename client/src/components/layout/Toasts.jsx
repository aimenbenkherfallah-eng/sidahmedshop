import { useStore } from '../../context/StoreContext.jsx';

export default function Toasts() {
  const { toasts } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-fadeIn rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg ${
            t.type === 'error' ? 'bg-red-500' : 'bg-accent-500'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
