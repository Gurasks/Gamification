import React from 'react';
import Navbar from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  noScroll?: boolean;
  backgroundClass?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  noScroll = false,
  backgroundClass = "bg-gradient-to-br from-blue-50 to-indigo-100"
}) => {
  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      <Navbar />
      <main className={noScroll ? 'h-[calc(100vh-4rem-1px)] overflow-hidden' : 'min-h-[calc(100vh-4rem-1px)]'}>
        {children}
      </main>
    </div>
  );
};