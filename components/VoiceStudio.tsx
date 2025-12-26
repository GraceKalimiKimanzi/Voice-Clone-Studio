
import React, { useState, useRef } from 'react';
import { Upload, Mic, Play, Download, Trash2, CheckCircle, Sparkles, AlertCircle, Loader2, Waves, Globe, User, Smile, Fingerprint, Star, FileText } from 'lucide-react';
import { AppState, VoiceSample, VoiceProfile, SynthesisConfig } from '../types';
import { analyzeVoiceSample, synthesizeSpeech } from '../services/geminiService';
import { Visualizer } from './Visualizer';

export const VoiceStudio: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [profile, setProfile] = useState<VoiceProfile | null>(null);
  const [script, setScript] = useState<string>('');
  const [isConsentGiven, setIsConsentGiven] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [config, setConfig] = useState<SynthesisConfig>({
    speed: 1.0,
    pitch: 1.0,
    emphasis: 'neutral',
    emotion: 'neutral',
    format: 'wav',
    professionalMode: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newSamples: VoiceSample[] = Array.from(files).map((file: File) => ({
      id: Math.random().toString(36).substring(2, 11),
      name: file.name,
      blob: file,
      url: URL.createObjectURL(file),
      duration: 0,
      status: 'pending'
    }));

    setSamples(prev => [...prev, ...newSamples]);
  };

  const removeSample = (id: string) => {
    setSamples(prev => prev.filter(s => s.id !== id));
  };

  const startAnalysis = async () => {
    if (!isConsentGiven) {
      setErrorMessage("Please confirm you have rights to this voice.");
      return;
    }
    if (samples.length === 0) {
      setErrorMessage("Upload at least one voice sample.");
      return;
    }

    setAppState(AppState.ANALYZING);
    setErrorMessage(null);

    try {
      const result = await analyzeVoiceSample(samples[0].blob);
      setProfile(result);
      setAppState(AppState.READY);
    } catch (err: any) {
      setErrorMessage("Analysis failed: " + err.message);
      setAppState(AppState.IDLE);
    }
  };

  const handleGenerate = async () => {
    if (!script.trim() || !profile) return;
    
    setAppState(AppState.GENERATING);
    setErrorMessage(null);

    try {
      const audioUrl = await synthesizeSpeech(script, profile, config);
      setGeneratedAudio(audioUrl);
      setAppState(AppState.READY);
    } catch (err: any) {
      setErrorMessage("Generation failed: " + err.message);
      setAppState(AppState.READY);
    }
  };

  const downloadAudio = () => {
    if (!generatedAudio) return;
    const a = document.createElement('a');
    a.href = generatedAudio;
    a.download = `sauti-pro-${Date.now()}.${config.format}`;
    a.click();
  };

  const useTranscript = () => {
    if (profile?.suggestedScript) {
      setScript(profile.suggestedScript);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stage 1: Enrollment */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">1. Identity Enrollment</h2>
            <p className="text-sm text-zinc-500 font-medium">Cloning your 100% native timbre & rhythm</p>
          </div>
          {profile && (
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-black bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-400/20">
              <Fingerprint className="w-4 h-4" /> Timbre Lock: Active
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-950 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-indigo-500/5"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="audio/*" 
                  multiple 
                  onChange={handleFileUpload}
                />
                <div className="bg-zinc-800 group-hover:bg-indigo-600 p-4 rounded-full mb-4 transition-all">
                  <Mic className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                </div>
                <p className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Weka Sauti Yako</p>
                <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest font-bold">Neural Direct-Map Enabled</p>
              </div>

              {appState === AppState.ANALYZING && (
                <div className="animate-in fade-in zoom-in duration-300">
                  <Visualizer isActive={true} color="#6366f1" />
                  <p className="text-[10px] text-center text-indigo-400 font-black uppercase mt-2 tracking-widest animate-pulse">Deconstructing Identity...</p>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                <input 
                  type="checkbox" 
                  checked={isConsentGiven}
                  onChange={(e) => setIsConsentGiven(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600" 
                />
                <label className="text-xs text-zinc-400 leading-tight">
                  I grant permission for VoxClone to replicate my unique vocal tract signature and professionalize the recording.
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2 uppercase tracking-tight">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  Source DNA ({samples.length})
                </h3>
                {samples.length > 0 && (
                  <button 
                    onClick={startAnalysis}
                    disabled={appState === AppState.ANALYZING}
                    className="text-xs font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 uppercase tracking-widest"
                  >
                    {appState === AppState.ANALYZING ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Neural Deep Scan
                  </button>
                )}
              </div>
              
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl h-[280px] overflow-y-auto p-2 space-y-2">
                {samples.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                    <Waves className="w-8 h-8 mb-2" />
                    <p className="text-[10px] uppercase font-black tracking-widest">Awaiting Timbre Sample</p>
                  </div>
                ) : (
                  samples.map((sample) => (
                    <div key={sample.id} className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800 group hover:border-indigo-500/30 transition-all">
                      <div className="h-8 w-8 bg-indigo-500/10 rounded flex items-center justify-center">
                        <Play className="w-3 h-3 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate text-zinc-200">{sample.name}</p>
                        <p className="text-[10px] text-emerald-500/80 uppercase font-black tracking-tighter">Reference ID: {sample.id}</p>
                      </div>
                      <button 
                        onClick={() => removeSample(sample.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stage 2: Studio Rendering */}
      {profile && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 animate-in fade-in zoom-in duration-500 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border-r border-zinc-800 pr-6">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Neural Fingerprint</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block uppercase font-bold tracking-widest">Gender / Timbre</label>
                  <p className="text-sm font-black text-white flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-500" /> {profile.gender}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block uppercase font-bold tracking-widest">Regional Lock</label>
                  <p className="text-sm font-black text-white flex items-center gap-1">
                    <Globe className="w-3 h-3 text-indigo-500" /> {profile.accent || 'Kenyan Native'} 
                  </p>
                </div>
                <div className="pt-2">
                   <div className="flex gap-1 flex-wrap">
                      {profile.characteristics.map((c: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-zinc-800 text-[9px] text-zinc-400 rounded-md border border-zinc-700 font-bold uppercase tracking-wider">
                          {c}
                        </span>
                      ))}
                   </div>
                </div>
                
                {/* Professional Toggle */}
                <div className="pt-6 border-t border-zinc-800">
                  <button 
                    onClick={() => setConfig({...config, professionalMode: !config.professionalMode})}
                    className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group ${config.professionalMode ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-zinc-950 border-zinc-800'}`}
                  >
                    <div className="text-left">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${config.professionalMode ? 'text-indigo-400' : 'text-zinc-500'}`}>Professional Mode</p>
                      <p className="text-[9px] text-zinc-500 leading-none mt-1">Studio Refinement Engine</p>
                    </div>
                    <Star className={`w-4 h-4 transition-colors ${config.professionalMode ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 pl-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Direct Studio Synthesis</h3>
                {profile.suggestedScript && (
                  <button 
                    onClick={useTranscript}
                    className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 uppercase tracking-widest bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 transition-all"
                  >
                    <FileText className="w-3 h-3" />
                    Professionalize Sample Text
                  </button>
                )}
              </div>
              <div className="space-y-6">
                <div className="relative group">
                  <textarea 
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Enter the script from your audio sample to generate the professionalized version..."
                    className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-200 focus:ring-1 focus:ring-indigo-500 outline-none resize-none placeholder:text-zinc-600 transition-all group-hover:border-zinc-700"
                  ></textarea>
                </div>

                {appState === AppState.GENERATING && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Visualizer isActive={true} color="#10b981" />
                    <p className="text-[10px] text-center text-emerald-400 font-black uppercase mt-2 tracking-widest animate-pulse">Mastering Neural Identity Output...</p>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                   <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-2 font-black uppercase tracking-widest">
                          <span>Prosody Speed</span>
                          <span>{config.speed}x</span>
                        </div>
                        <input 
                          type="range" min="0.7" max="1.3" step="0.1" 
                          value={config.speed}
                          onChange={(e) => setConfig({...config, speed: parseFloat(e.target.value)})}
                          className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-2 font-black uppercase tracking-widest items-center">
                          <span className="flex items-center gap-1"><Smile className="w-3 h-3" /> Vocal Emotion</span>
                          <span>{config.emotion}</span>
                        </div>
                        <select 
                          value={config.emotion}
                          onChange={(e) => setConfig({...config, emotion: e.target.value as any})}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 font-bold uppercase tracking-wider outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="neutral">Neutral</option>
                          <option value="happy">Happy</option>
                          <option value="sad">Somber</option>
                          <option value="excited">Energetic</option>
                          <option value="serious">Professional</option>
                        </select>
                      </div>
                   </div>

                   <div className="w-full md:w-auto flex flex-col justify-end">
                      <button 
                        onClick={handleGenerate}
                        disabled={appState === AppState.GENERATING || !script}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20 uppercase text-xs tracking-widest"
                      >
                        {appState === AppState.GENERATING ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Synthesizing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Render Studio Quality
                          </>
                        )}
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Output Section */}
      {generatedAudio && (
        <section className="bg-white text-black rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-500 border border-white">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-16 w-16 bg-black rounded-2xl flex items-center justify-center shrink-0">
                 <Waves className="w-8 h-8 text-indigo-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 mb-1">
                   <h3 className="font-black text-lg uppercase tracking-tight italic">Studio-Grade Render</h3>
                   <span className="bg-black text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">HD Audio</span>
                </div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest text-[10px]">Neural identity mapped & professionally polished</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <audio controls src={generatedAudio} className="h-10 w-full md:w-64" />
                 <button 
                  onClick={downloadAudio}
                  className="p-3 bg-black text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-lg"
                 >
                   <Download className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </section>
      )}

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-black animate-pulse uppercase tracking-widest">
          <AlertCircle className="w-5 h-5" />
          {errorMessage}
        </div>
      )}
    </div>
  );
};
