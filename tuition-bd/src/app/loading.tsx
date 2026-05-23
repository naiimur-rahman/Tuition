export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center w-full">
      <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center gap-5 shadow-2xl">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Loading</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please wait a moment...</p>
        </div>
      </div>
    </div>
  );
}
