
import React from 'react';
import { GameState } from '../types';

interface SidebarLeftProps {
  state: GameState;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({ state }) => {
  return (
    <div className="w-full md:w-72 bg-slate-900/50 backdrop-blur-md border-r border-slate-800 h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-10">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
          Current Quest
        </h2>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 shadow-inner">
          <p className="text-amber-200 font-medium leading-tight">
            {state.currentQuest || "Awaiting destiny..."}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          Inventory
        </h2>
        <ul className="space-y-2">
          {state.inventory.length > 0 ? (
            state.inventory.map((item, idx) => (
              <li 
                key={idx}
                className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 transition-colors flex items-center gap-3 group"
              >
                <div className="w-6 h-6 flex items-center justify-center bg-slate-700 rounded text-[10px] group-hover:scale-110 transition-transform">
                  📦
                </div>
                {item}
              </li>
            ))
          ) : (
            <p className="text-slate-600 text-sm italic">Empty pockets...</p>
          )}
        </ul>
      </div>

      <div className="mt-auto pt-10">
        <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-xl">
          <h3 className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter mb-1">Visual Style</h3>
          <p className="text-xs text-indigo-200 capitalize">{state.visualStyle}</p>
        </div>
      </div>
    </div>
  );
};

export default SidebarLeft;
