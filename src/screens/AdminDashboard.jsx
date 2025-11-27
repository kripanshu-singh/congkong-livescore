import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Trophy, X, MonitorPlay, Unlock, Calculator, Timer, Pause, Play, Activity, LogOut } from 'lucide-react';
import { AppContext } from '../context';
import { SettingsBar, GlassCard } from '../components/ui';
import { TeamDetailModal } from '../components/modals';

const AdminDashboard = ({ teams, scores, judges, onLogout, control, onControlUpdate, onUnlock }) => {
  const { t, lang } = useContext(AppContext);
  const [mode, setMode] = useState('DASHBOARD');
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  const stats = useMemo(() => {
    const totalVotes = Object.keys(scores).length;
    const progress = Math.round((totalVotes / (teams.length * judges.length)) * 100);
    
    const teamJudgedData = teams.map(t => {
      const tScores = judges.map(j => scores[`${t.id}_${j.id}`]).filter(Boolean);
      const scoresList = tScores.map(s => s.total);
      
      let bizScore = 0, mktScore = 0, creScore = 0;
      tScores.forEach(s => {
         Object.entries(s.detail).forEach(([k, v]) => {
            if (k.startsWith('b')) bizScore += v;
            if (k.startsWith('m')) mktScore += v;
            if (k.startsWith('c')) creScore += v;
         });
      });

      let judgeAvg = 0;
      if (scoresList.length > 2) {
        const max = Math.max(...scoresList);
        const min = Math.min(...scoresList);
        const sum = scoresList.reduce((a, b) => a + b, 0);
        judgeAvg = (sum - max - min) / (scoresList.length - 2);
      } else if (scoresList.length > 0) {
        judgeAvg = scoresList.reduce((a, b) => a + b, 0) / scoresList.length;
      }
      judgeAvg = Math.round(judgeAvg * 100) / 100;

      return { ...t, judgeAvg, bizScore, mktScore, creScore, count: tScores.length };
    });

    const finalRanking = teamJudgedData.sort((a, b) => {
       if (b.judgeAvg !== a.judgeAvg) return b.judgeAvg - a.judgeAvg;
       if (b.bizScore !== a.bizScore) return b.bizScore - a.bizScore;
       if (b.mktScore !== a.mktScore) return b.mktScore - a.mktScore;
       return b.creScore - a.creScore;
    });

    return { progress, totalVotes, teamStats: finalRanking };
  }, [teams, scores, judges]);

  // Timer Logic
  const toggleTimer = () => {
    const currentTimer = control?.timer || { isRunning: false, seconds: 0 };
    onControlUpdate({ 
      ...control, 
      timer: { ...currentTimer, isRunning: !currentTimer.isRunning }
    });
  };

  const resetTimer = () => {
    onControlUpdate({ 
      ...control, 
      timer: { isRunning: false, seconds: 420 } // 7 minutes
    });
  };

  useEffect(() => {
    let interval;
    if (control?.timer?.isRunning && control.timer.seconds > 0) {
      interval = setInterval(() => {
        onControlUpdate({
          ...control,
          timer: { ...control.timer, seconds: control.timer.seconds - 1 }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [control?.timer?.isRunning, control?.timer?.seconds]);


  if (mode === 'CEREMONY') {
    return (
      <div className="fixed inset-0 bg-black text-white z-50 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-black to-black" />
        <button onClick={() => setMode('DASHBOARD')} className="absolute top-8 right-8 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20"><X className="w-6 h-6"/></button>
        
        <div className="z-10 text-center space-y-8 animate-in zoom-in duration-1000">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm font-bold uppercase tracking-widest mb-4">
              <Trophy className="w-4 h-4" /> {t.grand_prix}
           </div>
           <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
              {stats.teamStats[0]?.name}
           </h1>
           <div className="text-2xl text-slate-400 font-light">{lang === 'en' ? stats.teamStats[0]?.univ_en : stats.teamStats[0]?.univ}</div>
           <div className="mt-12 flex flex-col items-center">
             <div className="text-sm text-slate-500 mb-2 uppercase tracking-widest">{t.final_score_label}</div>
             <div className="text-8xl font-bold text-white/90 select-none font-mono">
                {stats.teamStats[0]?.judgeAvg.toFixed(2)}
             </div>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 font-sans p-6 text-slate-900 transition-colors duration-500">
      <TeamDetailModal isOpen={!!selectedTeam} onClose={() => setSelectedTeam(null)} team={selectedTeam} judges={judges} scores={scores} />

      <header className="flex justify-between items-center mb-8 px-2">
         <div>
            <h1 className="text-4xl font-black tracking-tighter mb-1 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">{t.mission_control}</h1>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> {t.system_status}</span>
               {control?.activeTeamId && <span className="text-blue-500 flex items-center gap-1"><MonitorPlay className="w-3 h-3"/> {t.current_presenting}: {teams.find(t=>t.id===control.activeTeamId)?.name}</span>}
            </div>
         </div>
         <div className="flex gap-3">
            <SettingsBar />
            <div className="bg-slate-100  rounded-full px-4 py-2 flex items-center gap-3 border border-slate-200 ">
               <Timer className="w-4 h-4 text-slate-500"/>
               <span className="font-mono font-bold text-lg w-16 text-center">
                 {Math.floor((control?.timer?.seconds || 0) / 60)}:{String((control?.timer?.seconds || 0) % 60).padStart(2, '0')}
               </span>
               <div className="flex gap-1">
                 <button onClick={toggleTimer} className="p-1 hover:bg-white/10 rounded-full">{control?.timer?.isRunning ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}</button>
                 <button onClick={resetTimer} className="p-1 hover:bg-white/10 rounded-full"><Activity className="w-4 h-4"/></button>
               </div>
            </div>

            <button onClick={() => setMode('CEREMONY')} className="px-5 py-2.5 bg-slate-900  text-white  rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
               <Play className="w-4 h-4 fill-current"/> {t.mode_ceremony}
            </button>
            <button onClick={onLogout} className="p-2.5 bg-slate-200  rounded-full hover:bg-slate-300 "><LogOut className="w-5 h-5"/></button>
         </div>
      </header>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
         {/* Left Col: Field Control */}
         <div className="col-span-3 flex flex-col gap-6">
            {/* Field Op 1: Active Team Control */}
            <GlassCard className="flex-1 p-0 flex flex-col overflow-hidden">
               <div className="p-5 border-b border-slate-100  bg-slate-50/50 ">
                  <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <MonitorPlay className="w-4 h-4 text-red-500"/> {t.force_sync}
                  </h4>
               </div>
               <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {teams.map(team => (
                    <button 
                      key={team.id}
                      onClick={() => onControlUpdate({ ...control, activeTeamId: team.id })}
                      className={`w-full p-3 text-left rounded-lg text-xs font-bold flex justify-between items-center transition-colors
                        ${control?.activeTeamId === team.id 
                          ? 'bg-red-500 text-white shadow-lg' 
                          : 'hover:bg-slate-100  text-slate-500'}
                      `}
                    >
                      <span>{team.seq}. {team.name}</span>
                      {control?.activeTeamId === team.id && <div className="w-2 h-2 bg-white rounded-full animate-pulse"/>}
                    </button>
                  ))}
               </div>
            </GlassCard>

            {/* Field Op 2: Emergency Unlock */}
            <GlassCard className="h-[200px] p-0 flex flex-col overflow-hidden">
               <div className="p-4 border-b border-slate-100  bg-slate-50/50 ">
                  <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-yellow-500"/> {t.emergency_unlock}
                  </h4>
               </div>
               <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {teams.map(team => (
                     judges.map(judge => {
                        const key = `${team.id}_${judge.id}`;
                        if (!scores[key]) return null;
                        return (
                           <div key={key} className="flex justify-between items-center bg-slate-50  p-2 rounded border border-slate-100 ">
                              <span className="text-[10px] text-slate-500">{judge.name} → {team.name}</span>
                              <button 
                                onClick={() => onUnlock(key)}
                                className="text-[10px] bg-slate-200  px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-colors"
                              >
                                Unlock
                              </button>
                           </div>
                        )
                     })
                  ))}
               </div>
            </GlassCard>
         </div>

         {/* Center: Leaderboard */}
         <div className="col-span-9">
            <GlassCard className="h-full flex flex-col p-0 overflow-hidden">
               <div className="p-5 border-b border-slate-100  bg-slate-50/50  flex justify-between items-center">
                  <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">{t.live_ranking}</h3>
                  <div className="text-[10px] text-slate-400 bg-slate-100  px-2 py-1 rounded flex items-center gap-1">
                     <Calculator className="w-3 h-3"/> {t.ranking_calc}
                  </div>
               </div>
               <div className="bg-slate-100/50  p-3 grid grid-cols-12 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-1 text-center">{t.rank}</div>
                  <div className="col-span-7 pl-2">{t.team}</div>
                  <div className="col-span-2 text-center">{t.judge_progress}</div>
                  <div className="col-span-2 text-right pr-4">{t.total_score}</div>
               </div>
               <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {stats.teamStats.map((team, idx) => (
                     <div 
                        key={team.id} 
                        onClick={() => setSelectedTeam(team)}
                        className="grid grid-cols-12 items-center p-4 rounded-xl hover:bg-white/80 transition-all duration-300 group cursor-pointer border border-transparent hover:border-slate-200 hover:shadow-md"
                     >
                        <div className="col-span-1 text-center">
                           <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs mx-auto ${idx===0 ? 'bg-yellow-400 text-black' : 'bg-slate-200  text-slate-500'}`}>
                              {idx + 1}
                           </div>
                        </div>
                        <div className="col-span-7 pl-2 min-w-0">
                           <div className="font-bold text-sm truncate text-slate-900 ">{team.name}</div>
                           <div className="text-xs text-slate-400 truncate">{lang === 'en' ? team.univ_en : team.univ} | {team.presenter}</div>
                        </div>
                        <div className="col-span-2 text-center flex justify-center">
                           <span className={`text-xs px-2 py-1 rounded-full font-bold ${team.count === judges.length ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                              {team.count} / {judges.length}
                           </span>
                        </div>
                        <div className="col-span-2 text-right pr-4">
                           <div className="text-xl font-mono font-black text-slate-900 ">
                              {team.judgeAvg.toFixed(2)}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </GlassCard>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
