import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-auto flex justify-center items-center">
      <a 
        href="https://www.congkong.net/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="opacity-80 hover:opacity-100 transition-opacity"
      >
        <img 
          src="/conkkong-logo.svg" 
          alt="CongKong Friends" 
          className="h-8"
        />
      </a>
    </footer>
  );
}
