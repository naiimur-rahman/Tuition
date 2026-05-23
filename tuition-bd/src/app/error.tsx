'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center w-full px-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl flex flex-col items-center justify-center gap-6 shadow-2xl text-center border-red-500/20">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Something went wrong!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
        </div>
        
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium w-full mt-2 shadow-lg"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
