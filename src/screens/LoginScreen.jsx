import React, { useState, useContext } from 'react';
import { Sparkles, CalendarClock, MapPin, Command, ChevronRight, Lock } from 'lucide-react';
import { AppContext } from '../context';
import { SettingsBar, GlassCard } from '../components/ui';
import { AdminLoginModal } from '../components/modals';
import { JUDGES } from '../data';

const LoginScreen = ({ onLogin }) => {
  const { t } = useContext(AppContext);
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex items-center justify-center p-6 font-sans selection:bg-blue-500/30 transition-colors duration-500">
      <AdminLoginModal 
        isOpen={showAdmin} 
        onClose={() => setShowAdmin(false)} 
        onLogin={() => onLogin({ id: 'admin', name: '운영본부', role: 'admin' })} 
      />
      
      <div className="absolute top-6 right-6 z-50">
        <SettingsBar />
      </div>
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm text-slate-600 dark:text-slate-300">
              <Sparkles className="w-3 h-3 text-blue-500" /> LiveScore Titanium Edition
            </div>
            <h1 className="text-5xl lg:text-6xl font-semibold tracking-tighter text-slate-900 dark:text-white mb-6 leading-tight break-keep">
              {t.app_title}<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{t.app_subtitle}</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md leading-relaxed whitespace-pre-line">
               {t.app_desc}
            </p>
          </div>
          
          <div className="flex gap-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5 text-slate-700 dark:text-white" />
               </div>
               <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">{t.date_label}</div>
                  <div className="text-sm font-semibold dark:text-white">{t.date_val}</div>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-slate-700 dark:text-white" />
               </div>
               <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">{t.loc_label}</div>
                  <div className="text-sm font-semibold dark:text-white">{t.loc_val}</div>
               </div>
            </div>
          </div>
        </div>

        <GlassCard className="p-8 h-[600px] flex flex-col shadow-2xl border-white/60 dark:border-white/10">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.login_judge}</h2>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center"><Command className="w-4 h-4" /></div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {JUDGES.map(judge => (
              <button
                key={judge.id}
                onClick={() => onLogin(judge)}
                className="w-full group flex items-center gap-4 p-3 rounded-[20px] hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-200 shadow-inner group-hover:scale-105 transition-transform">
                  {judge.name[0]}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-base text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{judge.name}</div>
                  <div className="text-xs text-slate-500 font-medium">{judge.company} {judge.position}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
            <button 
              onClick={() => setShowAdmin(true)}
              className="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-xs font-bold flex items-center justify-center gap-2"
            >
              <Lock className="w-3 h-3" /> {t.login_admin}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default LoginScreen;
