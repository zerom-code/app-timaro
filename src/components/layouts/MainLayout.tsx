
import React from 'react';
import Header from '../ui/Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex-grow" style={{ paddingTop: 'calc(72px + env(safe-area-inset-top))' }}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
