
import React, { useState } from 'react';

interface GameSetupProps {
  onStart: (genre: string, visualStyle: string) => void;
}

const GENRES = ["Dark Fantasy", "Cyberpunk", "Space Opera", "Cthulhu Mythos", "Wild West Steampunk", "High Fantasy"];
const STYLES = ["Studio Ghibli", "Cyberpunk Neon", "Oil Painting", "Dark Noir", "Vibrant Watercolor", "Hyper-Realistic"];

const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [genre, setGenre] = useState(GENRES[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onStart(genre, style);
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto p-12 bg-slate-900/80 border border-slate-800 rounded-3xl text-center shadow-2xl">
        <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-cinzel text-indigo-400 mb-2">Weaving Reality...</h2>
        <p className="text-slate-400">Crafting the opening passage of your legend.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
      <h1 className="text-4xl font-cinzel text-center text-white mb-8">Begin Your Odyssey</h1>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Select Genre</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GENRES.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGenre(g)}
                className={`p-3 text-sm rounded-xl border transition-all ${
                  genre === g ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Art Style (Consistent Throughout)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STYLES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={`p-3 text-sm rounded-xl border transition-all ${
                  style === s ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/30' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-white text-slate-950 font-bold py-4 px-8 rounded-2xl hover:bg-indigo-50 transition-colors shadow-xl text-lg flex items-center justify-center gap-2 group"
        >
          Enter the Chronos Weaver
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </form>
    </div>
  );
};

export default GameSetup;
