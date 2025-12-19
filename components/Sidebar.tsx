
import React from 'react';
import { CreditState, AppTab, User } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  credits: CreditState;
  user: User;
  onOpenBilling: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, credits, user, onOpenBilling }) => {
  const navItems: { id: AppTab; label: string; icon: string; badge?: string }[] = [
    { id: 'studio', label: 'Production Studio', icon: 'fa-wand-magic-sparkles' },
    { id: 'branding', label: 'Brand Studio', icon: 'fa-palette' },
    { id: 'distribution', label: 'Distribution', icon: 'fa-paper-plane' },
    { id: 'motion', label: 'AI Motion', icon: 'fa-video', badge: 'Soon' },
    { id: 'settings', label: 'System Admin', icon: 'fa-user-shield' },
  ];

  const getSubLabel = () => {
    if (credits.subscriptionLevel === 'pro') return 'Pro Member';
    if (credits.subscriptionLevel === 'basic') return 'Basic Member';
    return 'Free Tier';
  };

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
          <i className="fa-solid fa-camera-retro text-blue-600"></i>
          <span>The Shooter</span>
        </h1>
      </div>

      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 border border-slate-700/50">
          <img src={user.avatar} className="w-10 h-10 rounded-lg bg-slate-800" alt="User" />
          <div className="overflow-hidden text-left">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate uppercase font-black tracking-tighter">{getSubLabel()}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
              : 'text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <i className={`fa-solid ${item.icon} w-5`}></i>
              <span className="font-bold text-xs uppercase italic tracking-tighter">{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/20">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-4">
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700 shadow-inner">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Credits Terminal</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-tighter">Trial</span>
              <span className="text-white font-black">{credits.freeGenerationsRemaining}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-tighter">Balance</span>
              <span className="text-blue-500 font-black">{credits.creditsRemaining}</span>
            </div>
          </div>
          <button 
            onClick={onOpenBilling}
            className="w-full mt-4 py-2.5 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-[10px] font-black uppercase text-white tracking-widest transition-all"
          >
            Refill Engine
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
