import React, { useState, useEffect, useMemo, useContext } from 'react';
import { LogOut, MonitorPlay, PenTool, Sparkles, Crown } from 'lucide-react';
import { AppContext } from '../context';
import { SettingsBar, GlassCard, AppleSlider, DynamicIsland, ToastMessage } from '../components/ui';
import { ConfirmSubmitModal } from '../components/modals';
import { CRITERIA } from '../data';

const JudgeInterface = ({ judge, teams, scores, onSubmit, onLogout, isOnline, control }) => {
  const { t, lang } = useContext(AppContext);
  const [activeTeamId, setActiveTeamId] = useState(teams[0].id);
  const [localScore, setLocalScore] = useState({});
  const [memo, setMemo] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved
  const [showToast, setShowToast] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Sync active team
  useEffect(() => {
    if (control?.activeTeamId) setActiveTeamId(control.activeTeamId);
  }, [control?.activeTeamId]);

  const activeTeam = teams.find(t => t.id === activeTeamId);
  const currentKey = `${activeTeamId}_${judge.id}`;
  const savedData = scores[currentKey];

  useEffect(() => {
    if (savedData) {
      setLocalScore(savedData.detail);
      setMemo(savedData.comment || '');
    } else {
      const init = {};
      CRITERIA.forEach(c => init[c.id] = 0);
      setLocalScore(init);
      setMemo('');
    }
  }, [activeTeamId, savedData]);

  const handleScoreChange = (id, val) => setLocalScore(prev => ({ ...prev, [id]: val }));
  const totalScore = Object.values(localScore).reduce((a, b) => a + b, 0);

  const handlePreSubmit = () => {
    setIsConfirmOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsConfirmOpen(false);
    setSaveStatus('saving');
    await onSubmit(activeTeamId, localScore, memo, 'digital-signature-placeholder');
    setSaveStatus('saved');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setSaveStatus('idle');
    }, 2000);
  };

  const zeroItems = CRITERIA.filter(c => (localScore[c.id] || 0) === 0);

  const groupedCriteria = useMemo(() => {
    const groups = {};
    CRITERIA.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, []);

  return (
    <div className="h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-white font-sans overflow-hidden flex flex-col selection:bg-blue-500/30 transition-colors duration-500">
      <ConfirmSubmitModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleFinalSubmit} 
        totalScore={totalScore}
        zeroItems={zeroItems}
      />
      
      <ToastMessage message={t.toast_saved} isVisible={showToast} />

      <DynamicIsland activeTeam={activeTeam} totalScore={totalScore} isOnline={isOnline} timer={control?.timer} saveStatus={saveStatus} />

      <div className="flex-1 flex overflow-hidden px-4 pb-4 gap-4">
        {/* Sidebar */}
        <div className="w-[300px] bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-[24px] flex flex-col border border-white/20 shadow-sm z-20">
          <div className="p-5 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                {judge.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{lang === 'en' ? (judge.name_en || judge.name) : judge.name}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{judge.company}</div>
              </div>
              <button onClick={onLogout}><LogOut className="w-4 h-4 text-slate-400 hover:text-red-500" /></button>
            </div>
            <div className="h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(Object.keys(scores).filter(k => k.includes(judge.id)).length / teams.length) * 100}%` }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {teams.map(team => {
              const scoreData = scores[`${team.id}_${judge.id}`];
              const isDone = !!scoreData;
              const isActive = activeTeamId === team.id;
              const isGlobalActive = control?.activeTeamId === team.id;

              return (
                <button
                  key={team.id}
                  onClick={() => setActiveTeamId(team.id)}
                  className={`w-full p-3 rounded-[16px] text-left transition-all duration-200 relative group
                    ${isActive ? 'bg-white dark:bg-black shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}
                    ${isGlobalActive && !isActive ? 'ring-1 ring-blue-500/50 ring-dashed' : ''}
                  `}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      {isGlobalActive && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title={t.current_presenting} />}
                      <span className={`font-bold text-xs ${isActive ? 'text-blue-600' : ''}`}>{team.name}</span>
                    </div>
                    {isDone && (
                      <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                        {scoreData.total}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{team.topic}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0 bg-white/50 dark:bg-[#1c1c1e]/50 backdrop-blur-md rounded-[24px] border border-white/20 shadow-sm overflow-hidden relative">
          <div className="p-6 pb-0 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <h1 className="text-2xl font-bold tracking-tight">{activeTeam.name}</h1>
                 {control?.activeTeamId === activeTeamId && (
                    <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse flex items-center gap-1">
                       <MonitorPlay className="w-3 h-3"/> LIVE
                    </span>
                 )}
              </div>
              <div className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
                 <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold dark:bg-blue-900 dark:text-blue-300">{lang === 'en' ? activeTeam.univ_en : activeTeam.univ}</span>
                 {activeTeam.topic}
              </div>
            </div>
            <div className="flex items-center gap-4">
               <SettingsBar />
               <div className="px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-full text-xs font-bold text-slate-500">
                 {activeTeam.seq} / {teams.length}
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-24 scroll-smooth">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                {Object.entries(groupedCriteria).map(([category, items]) => (
                  <GlassCard key={category} className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                       <div className={`w-1 h-4 rounded-full ${category === 'cat_creativity' ? 'bg-blue-500' : category === 'cat_market' ? 'bg-purple-500' : 'bg-amber-500'}`} />
                       <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t[category]}</h3>
                    </div>
                    <div className="space-y-4">
                      {items.map(crit => (
                        <AppleSlider 
                          key={crit.id} 
                          label={lang === 'en' ? crit.label_en : crit.label} 
                          desc={crit.desc} 
                          max={crit.max} 
                          value={localScore[crit.id] || 0} 
                          onChange={(val) => handleScoreChange(crit.id, val)} 
                        />
                      ))}
                    </div>
                  </GlassCard>
                ))}
              </div>

              <div className="space-y-6">
                 <GlassCard className="p-5 flex flex-col h-[280px]">
                    <div className="flex justify-between items-center mb-3">
                       <h3 className="font-bold text-sm flex items-center gap-2"><PenTool className="w-4 h-4 text-blue-500"/> {t.comment_placeholder}</h3>
                       <button onClick={() => setShowAI(!showAI)} className="text-[10px] bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md font-bold flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500 transition-colors">
                          <Sparkles className="w-3 h-3" /> {t.ai_analysis}
                       </button>
                    </div>
                    {showAI && (
                       <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300 animate-in slide-in-from-top-2">
                          <strong>{t.ai_insight}:</strong> {t.ai_msg}
                       </div>
                    )}
                    <textarea 
                       value={memo} onChange={(e) => setMemo(e.target.value)}
                       placeholder={t.comment_placeholder}
                       className="flex-1 w-full bg-transparent border-none focus:ring-0 text-sm resize-none placeholder:text-slate-300 leading-relaxed p-0"
                    />
                 </GlassCard>
                 
                 <div className="p-6 rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                       <div className="text-xs font-bold opacity-70 uppercase mb-1">{t.score_total}</div>
                       <div className="text-5xl font-black tracking-tighter">{totalScore}</div>
                    </div>
                    <button 
                       onClick={handlePreSubmit}
                       className="relative z-10 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                       {savedData ? t.update : t.submit}
                    </button>
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
                       <Crown className="w-32 h-32" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JudgeInterface;
