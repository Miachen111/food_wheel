import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="px-4 pb-20 md:max-w-3xl md:mx-auto">
        {children}
      </main>
      {/* NavigationBar 預留位置 */}
    </div>
  );
}
