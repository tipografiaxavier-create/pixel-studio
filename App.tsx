
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import SettingsSidebar from './components/SettingsSidebar';
import Gallery from './components/Gallery';
import { PixelImage, GenerationSettings, GenerationState, AspectRatio } from './types';
import { generateImage, refinePrompt, editImage } from './services/geminiService';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<PixelImage[]>([]);
  const [state, setState] = useState<GenerationState>(GenerationState.IDLE);
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: '1:1',
    style: 'Natural',
    enhancePrompt: true
  });
  const [selectedImage, setSelectedImage] = useState<PixelImage | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');

  // Local storage for history
  useEffect(() => {
    const saved = localStorage.getItem('pixel-studio-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pixel-studio-history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState(GenerationState.REFINING);
    try {
      let finalPrompt = prompt;
      if (settings.enhancePrompt) {
        finalPrompt = await refinePrompt(prompt, settings.style);
      } else {
        finalPrompt = `${prompt}. Style: ${settings.style}`;
      }

      setState(GenerationState.GENERATING);
      const imageUrl = await generateImage(finalPrompt, settings.aspectRatio);

      const newImage: PixelImage = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: finalPrompt,
        timestamp: Date.now(),
        aspectRatio: settings.aspectRatio,
        style: settings.style
      };

      setHistory(prev => [newImage, ...prev]);
      setPrompt('');
      setState(GenerationState.IDLE);
    } catch (error) {
      console.error(error);
      setState(GenerationState.ERROR);
      setTimeout(() => setState(GenerationState.IDLE), 3000);
    }
  };

  const handleRemix = async () => {
    if (!selectedImage || !editPrompt.trim()) return;

    setState(GenerationState.GENERATING);
    try {
      const imageUrl = await editImage(selectedImage.url, editPrompt, selectedImage.aspectRatio as AspectRatio);
      
      const newImage: PixelImage = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: `Remix: ${editPrompt} (from: ${selectedImage.prompt})`,
        timestamp: Date.now(),
        aspectRatio: selectedImage.aspectRatio,
        style: selectedImage.style
      };

      setHistory(prev => [newImage, ...prev]);
      setEditPrompt('');
      setIsEditMode(false);
      setSelectedImage(newImage);
      setState(GenerationState.IDLE);
    } catch (error) {
      console.error(error);
      setState(GenerationState.ERROR);
      setTimeout(() => setState(GenerationState.IDLE), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 flex flex-col lg:flex-row gap-10">
        <div className="flex-1 flex flex-col gap-10">
          {/* Prompt Section */}
          <section className="glass p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -z-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] -z-10 rounded-full"></div>
            
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Start Creating
            </h2>
            
            <div className="space-y-4">
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your vision... (e.g., A cyberpunk samurai standing in neon rain)"
                  className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none group-hover:border-zinc-700"
                />
                <div className="absolute bottom-4 right-4 text-xs text-zinc-600">
                  {prompt.length} / 1000
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs hover:bg-zinc-700 transition-colors">Surprise me</button>
                  <button className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs hover:bg-zinc-700 transition-colors">Templates</button>
                </div>
                <button
                  disabled={state !== GenerationState.IDLE || !prompt.trim()}
                  onClick={handleGenerate}
                  className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {state === GenerationState.IDLE && "Generate"}
                  {state === GenerationState.REFINING && "Refining Prompt..."}
                  {state === GenerationState.GENERATING && (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  )}
                  {state === GenerationState.ERROR && "Failed. Try again?"}
                </button>
              </div>
            </div>
          </section>

          {/* Gallery Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold tracking-tight">Recent Creations</h3>
              <button 
                onClick={() => {
                  if(confirm("Clear your generation history?")) {
                    setHistory([]);
                  }
                }}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Clear History
              </button>
            </div>
            <Gallery images={history} onSelect={(img) => {
              setSelectedImage(img);
              setIsEditMode(false);
            }} />
          </section>
        </div>

        {/* Sidebar */}
        <SettingsSidebar settings={settings} setSettings={setSettings} />
      </main>

      {/* Fullscreen Overlay / Modal for Detail View */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl glass rounded-3xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh]">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black rounded-full transition-colors"
            >
              ✕
            </button>
            
            <div className="flex-[1.5] bg-zinc-950 flex items-center justify-center p-4">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.prompt} 
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            <div className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto bg-zinc-900">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Prompt</span>
                <p className="text-zinc-300 text-sm leading-relaxed italic">"{selectedImage.prompt}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Style</span>
                  <span className="text-sm font-medium">{selectedImage.style || 'Natural'}</span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Aspect Ratio</span>
                  <span className="text-sm font-medium">{selectedImage.aspectRatio}</span>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                {isEditMode ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <textarea
                      autoFocus
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="Describe what to change..."
                      className="w-full h-24 bg-black/50 border border-zinc-700 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleRemix}
                        disabled={state === GenerationState.GENERATING || !editPrompt.trim()}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                      >
                        {state === GenerationState.GENERATING ? 'Processing...' : 'Apply Changes'}
                      </button>
                      <button 
                        onClick={() => setIsEditMode(false)}
                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsEditMode(true)}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      Remix Image
                    </button>
                    <a 
                      href={selectedImage.url} 
                      download={`pixel-${selectedImage.id}.png`}
                      className="w-full py-4 bg-white text-black rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      Download High-Res
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="py-10 border-t border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-white rounded-sm"></div>
             <span className="font-bold uppercase tracking-tighter mono">Pixel Studio</span>
          </div>
          <p className="text-xs text-zinc-600">© 2024 Pixel Studio AI. Powered by Gemini 2.5 Flash Image.</p>
          <div className="flex gap-6 text-xs text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
