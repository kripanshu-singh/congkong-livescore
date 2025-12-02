import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-8 mt-auto flex flex-col justify-center items-center backdrop-blur-md border-t border-slate-200/50 transition-colors duration-300">
      <div className="flex flex-row items-center gap-4">
        <a 
          href="https://www.congkong.net/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="opacity-80 hover:opacity-100 transition-opacity"
        >
          <img 
            src="/conkkong-logo.svg" 
            alt="CongKong Friends" 
            className="h-12"
          />
        </a>
        
        <div className="text-center space-y-1">
          <p className="text-2xl text-gray-700 tracking-wide font-extrabold ">
            CongKong Friends
          </p>
          <p className="text-[10px] text-slate-400">
            © 2025 CongKong Friends. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
