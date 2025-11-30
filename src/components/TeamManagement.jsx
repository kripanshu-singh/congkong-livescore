import React, { useState, useRef, useContext } from 'react';
import { Plus, Trash2, Upload, Download, Users, Save, X, FileText } from 'lucide-react';
import { GlassCard } from './ui';
import { AppContext } from '../context';

// Sub-component: Toolbar for actions
const TeamToolbar = ({ onAddClick, onUpload, onDownloadTemplate }) => {
  const { t } = useContext(AppContext);
  const fileInputRef = useRef(null);

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-600"/> {t.manage_teams}
      </h2>
      <div className="flex gap-2">
        {/* <button 
          onClick={onDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold cursor-pointer"
        >
          <FileText className="w-4 h-4"/> {t.btn_template}
        </button> */}
      
        <div className="relative">
          <input 
            type="file" 
            accept=".csv"
            ref={fileInputRef}
            onChange={onUpload}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold cursor-pointer"
          >
            <Upload className="w-4 h-4"/> {t.btn_csv_upload}
          </button>
        </div>
        <button 
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold shadow-lg shadow-blue-500/30 cursor-pointer"
        >
          <Plus className="w-4 h-4"/> {t.btn_add_team}
        </button>
      </div>
    </div>
  );
};

// Sub-component: Add Team Modal/Form
const AddTeamForm = ({ onClose, onSave }) => {
  const { t } = useContext(AppContext);
  const [newTeam, setNewTeam] = useState({
    name: '',
    univ: '',
    presenter: '',
    topic: '',
    univ_en: ''
  });

  const handleSave = () => {
    if (!newTeam.name || !newTeam.univ || !newTeam.presenter) {
      alert(t.msg_fill_required);
      return;
    }
    onSave(newTeam);
  };

  return (
    <GlassCard className="p-6 border-blue-200 bg-blue-50/50 mb-6">
      <div className="flex justify-between items-start mb-4">
         <h3 className="font-bold text-lg text-blue-900">{t.add_team_title}</h3>
         <button onClick={onClose} className="p-1 hover:bg-blue-100 rounded-full text-blue-500 cursor-pointer"><X className="w-5 h-5"/></button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">{t.label_team_name}</label>
          <input 
            value={newTeam.name}
            onChange={e => setNewTeam({...newTeam, name: e.target.value})}
            className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. DReaM"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">{t.label_affiliation}</label>
          <input 
            value={newTeam.univ}
            onChange={e => setNewTeam({...newTeam, univ: e.target.value})}
            className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. KOREATECH"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">{t.label_presenter}</label>
          <input 
            value={newTeam.presenter}
            onChange={e => setNewTeam({...newTeam, presenter: e.target.value})}
            className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Name"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">{t.label_topic}</label>
          <input 
            value={newTeam.topic}
            onChange={e => setNewTeam({...newTeam, topic: e.target.value})}
            className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Project Topic"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-md cursor-pointer"
        >
          <Save className="w-4 h-4"/> {t.btn_save}
        </button>
      </div>
    </GlassCard>
  );
};

// Sub-component: Team List Table
const TeamList = ({ teams, onDelete }) => {
  const { t } = useContext(AppContext);

  return (
    <GlassCard className="flex-1 overflow-hidden flex flex-col p-0">
      <div className="p-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm grid grid-cols-12 gap-4 font-bold text-xs text-slate-500 uppercase tracking-wider sticky top-0 z-10">
        <div className="col-span-1 text-center">{t.header_seq}</div>
        <div className="col-span-3">{t.header_team}</div>
        <div className="col-span-3">{t.header_affil}</div>
        <div className="col-span-2">{t.header_presenter}</div>
        <div className="col-span-2">{t.header_topic}</div>
        <div className="col-span-1 text-center">{t.header_action}</div>
      </div>
      <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
        {teams.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No teams registered yet.</div>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="grid grid-cols-12 gap-4 items-center p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all">
              <div className="col-span-1 text-center font-mono font-bold text-slate-400">{team.seq}</div>
              <div className="col-span-3 font-bold text-slate-800">{team.name}</div>
              <div className="col-span-3 text-sm text-slate-600">{team.univ}</div>
              <div className="col-span-2 text-sm text-slate-600">{team.presenter}</div>
              <div className="col-span-2 text-xs text-slate-500 truncate" title={team.topic}>{team.topic}</div>
              <div className="col-span-1 text-center flex justify-center">
                <button 
                  onClick={() => onDelete(team.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
};

// Main Component
export const TeamManagement = ({ teams, setTeams }) => {
  const { t } = useContext(AppContext);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTeam = (teamData) => {
    const team = {
      id: `t${Date.now()}`,
      seq: teams.length + 1,
      ...teamData,
      univ_en: teamData.univ_en || teamData.univ // Fallback
    };

    setTeams([...teams, team]);
    setIsAdding(false);
  };

  const handleDeleteTeam = (id) => {
    if (window.confirm(t.msg_confirm_delete)) {
      const updatedTeams = teams.filter(t => t.id !== id).map((t, index) => ({
        ...t,
        seq: index + 1 // Re-sequence
      }));
      setTeams(updatedTeams);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const newTeams = [];
      
      const startIndex = lines[0].includes('순서') || lines[0].includes('Order') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 4) {
             newTeams.push({
                id: `t${Date.now()}_${i}`,
                seq: newTeams.length + teams.length + 1,
                name: parts[1],
                univ: parts[2],
                presenter: parts[3],
                topic: parts[5] || '',
                univ_en: parts[2]
             });
        }
      }

      if (newTeams.length > 0) {
        const combined = [...teams, ...newTeams].map((t, idx) => ({ ...t, seq: idx + 1 }));
        setTeams(combined);
        alert(t.msg_csv_success);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadTemplate = () => {
    const headers = "순서,팀명,소속,발표자,시간,주제";
    const sample = "1,DReaM,한국기술교육대,유준철,13:10~13:22,스마트 트러스 로드(SMTR)";
    const blob = new Blob([`\uFEFF${headers}\n${sample}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'team_template.csv';
    link.click();
  };

  return (
    <div className="h-full flex flex-col">
      <TeamToolbar 
        onAddClick={() => setIsAdding(true)} 
        onUpload={handleCSVUpload} 
        onDownloadTemplate={downloadTemplate} 
      />
      
      {isAdding && (
        <AddTeamForm 
          onClose={() => setIsAdding(false)} 
          onSave={handleAddTeam} 
        />
      )}

      <TeamList 
        teams={teams} 
        onDelete={handleDeleteTeam} 
      />
    </div>
  );
};
