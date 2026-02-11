
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full glass px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
          <div className="w-4 h-4 bg-black"></div>
        </div>
        <h1 className="text-xl font-bold tracking-tighter uppercase mono">Pixel Studio</h1>
      </div>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
        <a href="#" className="hover:text-white transition-colors">Generate</a>
        <a href="#" className="hover:text-white transition-colors">History</a>
        <a href="#" className="hover:text-white transition-colors">Community</a>
      </nav>
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-colors">
          Pro Plan
        </button>
      </div>
    </header>
  );
};

export default Header;
