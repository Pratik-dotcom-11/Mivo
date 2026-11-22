import React from 'react';
import { Button } from '@/components/common/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-6xl font-extrabold text-brand-600">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-4">Page not found</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button
        variant="primary"
        size="sm"
        leftIcon={<Home className="w-4 h-4" />}
        className="mt-6"
        onClick={() => { window.location.href = '/'; }}
      >
        Back to Mivo
      </Button>
    </div>
  );
};
