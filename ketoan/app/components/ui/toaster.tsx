'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'group toast bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg',
          title: 'text-gray-900 dark:text-white font-medium',
          description: 'text-gray-500 dark:text-gray-400 text-sm',
          success: 'border-green-500 bg-green-50 dark:bg-green-900/20',
          error: 'border-red-500 bg-red-50 dark:bg-red-900/20',
          warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
          info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
        },
      }}
      richColors
      closeButton
    />
  );
}
