
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameOption, ImageResolution } from './types';
import { generateInitialState, updateStory, generateGameImage } from './services/geminiService';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import GameSetup from './components/GameSetup';
import ApiKeyGateway from './components/ApiKeyGateway';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageResolution, setImageResolution] = useState<ImageResolution>(ImageResolution.R1K);
  const [showApiKeyGate, setShowApiKeyGate] = useState(true);

  const startNewGame = async (genre: string, visualStyle: string) => {
    setIsProcessing(true);
    try {
      const data = await generateInitialState(genre, visualStyle);
      const newState: GameState = {
        ...data,
        visualStyle,
        history: [data.storyText]
      };
      setGameState(newState);
      
      // Generate initial image
      const img = await generateGameImage(data.imagePrompt, visualStyle, imageResolution);
      setCurrentImage(img);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChoice = async (option: GameOption) => {
    if (!gameState || isProcessing) return;
    setIsProcessing(true);
    setCurrentImage(null);

    try {
      const data = await updateStory(gameState, `${option.label}: ${option.description}`);
      const newState: GameState = {
        ...data,
        visualStyle: gameState.visualStyle,
        history: [...gameState.history, data.storyText]
      };
      setGameState(newState);
      
      const img = await generateGameImage(data.imagePrompt, gameState.visualStyle, imageResolution);
      setCurrentImage(img);
    } catch (error: any) {
      if (error.message === "API_KEY_RESET") {
        setShowApiKeyGate(true);
      }
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showApiKeyGate) {
    return <ApiKeyGateway onValidated={() => setShowApiKeyGate(false)} />;
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-slate-950 font-inter selection:bg-indigo-500/30">
      {!gameState ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
          <GameSetup onStart={startNewGame} />
        </div>
      ) : (
        <>
          {/* Left Sidebar */}
          <SidebarLeft state={gameState} />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-slate-950 flex flex-col relative">
            {/* Header Controls */}
            <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center">
              <h1 className="font-cinzel text-slate-200 text-lg tracking-widest uppercase">Chronos Weaver</h1>
              <div className="flex items-center gap-4">
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                  {Object.values(ImageResolution).map(res => (
                    <button
                      key={res}
                      onClick={() => setImageResolution(res)}
                      className={`px-3 py-1 text-[10px] font-bold rounded ${imageResolution === res ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            <div className="max-w-4xl mx-auto w-full p-6 md:p-10 space-y-10 pb-32">
              {/* Scene Visual */}
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
                {currentImage ? (
                  <img src={currentImage} alt="Scene" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-500">
                    <div className="w-12 h-12 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-xs font-medieval animate-pulse">Visualizing the tapestry...</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              </div>

              {/* Story Text */}
              <article className="prose prose-invert max-w-none">
                <div className="text-slate-300 text-lg leading-relaxed font-medieval whitespace-pre-wrap">
                  {gameState.storyText}
                </div>
              </article>

              {/* Choices */}
              <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  What shall you do?
                  <div className="h-px flex-1 bg-slate-800"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={isProcessing}
                      onClick={() => handleChoice(opt)}
                      className="text-left p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-xs font-bold text-indigo-400 border border-slate-700 group-hover:bg-indigo-900/40 group-hover:border-indigo-500 transition-colors">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-200 mb-1 group-hover:text-indigo-300">{opt.label}</h4>
                          <p className="text-sm text-slate-500 group-hover:text-slate-400">{opt.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Bottom Processing Indicator */}
            {isProcessing && (
              <div className="fixed bottom-0 left-0 right-0 h-1 bg-indigo-600 animate-pulse z-50 shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
            )}
          </main>

          {/* Right Sidebar (Chat) */}
          <SidebarRight gameState={gameState} />
        </>
      )}
    </div>
  );
};

export default App;
