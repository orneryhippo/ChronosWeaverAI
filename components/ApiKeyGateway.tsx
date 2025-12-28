
import React, { useEffect, useState } from 'react';

interface ApiKeyGatewayProps {
  onValidated: () => void;
}

declare global {
  // Rely on the globally defined AIStudio type provided by the environment
  interface Window {
    aistudio: AIStudio;
  }
}

const ApiKeyGateway: React.FC<ApiKeyGatewayProps> = ({ onValidated }) => {
  const [checking, setChecking] = useState(true);

  const checkKey = async () => {
    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (hasKey) {
        onValidated();
      } else {
        setChecking(false);
      }
    } catch (e) {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleOpenSelector = async () => {
    await window.aistudio.openSelectKey();
    // Proceed immediately to avoid race conditions as per documentation guidelines
    onValidated();
  };

  if (checking) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 border-4 border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-cinzel">Summoning the Chronicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-3xl font-cinzel text-indigo-400 mb-4">Chronos Weaver</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          To generate high-quality 4K imagery and access advanced story reasoning, you must select a valid API key from a paid GCP project.
        </p>
        <button
          onClick={handleOpenSelector}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 mb-4"
        >
          Select API Key
        </button>
        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 text-sm underline"
        >
          View Billing Documentation
        </a>
      </div>
    </div>
  );
};

export default ApiKeyGateway;
