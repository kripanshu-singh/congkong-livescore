import React, { useContext } from 'react';
import { Sun, Moon, Timer, CheckCircle2 } from 'lucide-react';
import { AppContext } from '../context';

/**
 * HELPER COMPONENT: Toggle Bar
 */
export const SettingsBar = () => {
  const { theme, toggleTheme, lang, setLang } = useContext(AppContext);
  
  return (
    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-full p-1 border border-white/40 shadow-sm">
      {/* <button 
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-white/20  transition-colors text-slate-700  cursor-pointer"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <div className="w-px h-4 bg-slate-300  mx-1"></div> */}
      <button
        onClick={() => setLang(prev => prev === 'ko' ? 'en' : 'ko')}
        className="px-3 py-1 rounded-full text-xs font-bold hover:bg-white/20  transition-colors text-slate-700  font-mono cursor-pointer"
      >
        {lang === 'ko' ? 'KO' : 'EN'}
      </button>
    </div>
  );
};

export const GlassCard = ({ children, className = "", active = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      relative overflow-hidden backdrop-blur-3xl transition-all duration-500 border
      ${active 
        ? 'bg-white/95 border-blue-500/50 shadow-[0_8px_32px_rgba(59,130,246,0.25)] ring-1 ring-blue-500/20' 
        : 'bg-white/70 border-white/40 shadow-xl shadow-slate-200/50 hover:bg-white/80 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-0.5'
      }
      rounded-[24px] ${className}
     cursor-pointer`}
  >
    {children}
  </div>
);

export const AppleSlider = ({ value, max, onChange, label, desc }) => {
  const percentage = (value / max) * 100;
  const getColor = (pct) => {
    if (pct >= 90) return 'bg-blue-600';
    if (pct >= 70) return 'bg-indigo-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="group select-none touch-none py-3">
      <div className="flex justify-between items-end mb-2 px-1">
        <div>
          <span className="text-[14px] font-bold text-slate-700  tracking-tight block">{label}</span>
          <span className="text-[11px] text-slate-400  font-medium">{desc}</span>
        </div>
        <span className="font-mono text-xl font-bold text-slate-900  flex items-baseline gap-1">
          {value}<span className="text-xs text-slate-400 font-normal">/{max}</span>
        </span>
      </div>
      <div className="relative h-11 w-full bg-slate-100  rounded-xl overflow-hidden transition-all active:scale-[0.99] border border-black/5  shadow-inner">
        <div 
          className={`absolute top-0 left-0 bottom-0 ${getColor(percentage)} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <input 
          type="range" min="0" max={max} step="1"
          value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        <div className="absolute bottom-0 w-full flex justify-between px-2 pointer-events-none opacity-30">
           {Array.from({length: max + 1}).map((_, i) => (
             <div key={i} className={`w-[1px] ${i % 5 === 0 ? 'h-2 bg-slate-400' : 'h-1 bg-slate-300'}`}></div>
           ))}
        </div>
      </div>
    </div>
  );
};

export const DynamicIsland = ({ activeTeam, totalScore, isOnline, timer, saveStatus }) => {
  const { t } = useContext(AppContext);
  return (
    <div className="flex justify-center w-full mb-6 sticky top-4 z-50 pointer-events-none">
      <div className="bg-[#1c1c1e] text-white rounded-full h-[44px] shadow-2xl flex items-center min-w-[140px] justify-between backdrop-blur-xl pointer-events-auto transition-all duration-500 hover:scale-105 hover:h-[54px] px-1 group border border-white/10 ring-1 ring-black/20">
        <div className="flex items-center gap-4 px-4 w-full justify-between">
          <div className="flex items-center gap-2.5">
             <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`} />
             <span className="font-semibold text-xs text-gray-200 truncate max-w-[120px] group-hover:max-w-[200px] transition-all">
               {activeTeam.name}
             </span>
          </div>
          
          {/* Save Status / Timer */}
          {saveStatus === 'saving' && (
             <span className="text-xs text-blue-400 animate-pulse font-mono">{t.status_saving}</span>
          )}
          {saveStatus === 'saved' && (
             <span className="text-xs text-green-400 font-mono">{t.status_saved}</span>
          )}
          
          {timer && timer.isRunning && saveStatus === 'idle' && (
             <div className="flex items-center gap-1.5 bg-red-900/50 px-2 py-0.5 rounded-full border border-red-500/30 animate-pulse">
                <Timer className="w-3 h-3 text-red-400" />
                <span className="text-xs font-mono font-bold text-red-100">{Math.floor(timer.seconds / 60)}:{String(timer.seconds % 60).padStart(2, '0')}</span>
             </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider hidden group-hover:block animate-in fade-in">Total</span>
            <span className={`text-lg font-bold font-mono ${totalScore >= 90 ? 'text-blue-400' : 'text-white'}`}>
              {totalScore}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Component
export const ToastMessage = ({ message, isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] animate-in fade-in zoom-in duration-300">
      <div className="bg-black/80 backdrop-blur-xl text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
        <div className="bg-green-500 rounded-full p-1">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-lg">{message}</span>
      </div>
    </div>
  );
};


