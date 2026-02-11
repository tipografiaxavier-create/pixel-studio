
import React from 'react';
import { AspectRatio, GenerationSettings } from '../types';

interface Props {
  settings: GenerationSettings;
  setSettings: (settings: GenerationSettings) => void;
}

const SettingsSidebar: React.FC<Props> = ({ settings, setSettings }) => {
  const aspectRatios: AspectRatio[] = ['1:1', '3:4', '4:3', '9:16', '16:9'];
  const styles = ['Natural', 'Cinematic', 'Pixel Art', 'Digital Art', 'Oil Painting', 'Abstract', '3D Render'];

  return (
    <div className="w-full md:w-72 flex flex-col gap-8 p-6 glass rounded-2xl h-fit">
      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-4">Aspect Ratio</label>
        <div className="grid grid-cols-3 gap-2">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio}
              onClick={() => setSettings({ ...settings, aspectRatio: ratio })}
              className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                settings.aspectRatio === ratio
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-4">Style Preset</label>
        <div className="flex flex-wrap gap-2">
          {styles.map((style) => (
            <button
              key={style}
              onClick={() => setSettings({ ...settings, style })}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                settings.style === style
                  ? 'bg-zinc-100 text-black border-zinc-100'
                  : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-white">AI Refiner</h4>
          <p className="text-xs text-zinc-500">Auto-enhance prompts</p>
        </div>
        <button
          onClick={() => setSettings({ ...settings, enhancePrompt: !settings.enhancePrompt })}
          className={`w-11 h-6 rounded-full transition-colors relative ${
            settings.enhancePrompt ? 'bg-blue-600' : 'bg-zinc-800'
          }`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            settings.enhancePrompt ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      </div>
    </div>
  );
};

export default SettingsSidebar;
