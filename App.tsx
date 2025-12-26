
import React from 'react';
import { VoiceStudio } from './components/VoiceStudio';
import { Mic, Waves, ShieldCheck, Zap } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-lg tracking-tight uppercase">VoxClone KE</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">How it works</a>
            <a href="#" className="hover:text-white transition-colors">Ethics</a>
            <div className="h-4 w-[1px] bg-zinc-800"></div>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-full transition-all text-xs">
              Mwanachama Pro
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Context */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-yellow-500" />
                Sauti Yako, Digitali
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Tengeneza sauti yako ya kweli katika sekunde chache. Our engine captures the unique warmth and rhythm of a human Kenyan accent with 95% accuracy.
              </p>
              
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm">
                  <div className="bg-zinc-800 p-1 rounded h-fit"><ShieldCheck className="w-4 h-4 text-emerald-500" /></div>
                  <div>
                    <p className="font-medium text-zinc-200">Ethical Sauti Only</p>
                    <p className="text-zinc-500">We prioritize human rights and explicit user consent.</p>
                  </div>
                </li>
                <li className="flex gap-3 text-sm">
                  <div className="bg-zinc-800 p-1 rounded h-fit"><Mic className="w-4 h-4 text-indigo-500" /></div>
                  <div>
                    <p className="font-medium text-zinc-200">95% Neural Match</p>
                    <p className="text-zinc-500">High-speed analysis for instant, studio-quality results.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/20">
              <h3 className="text-indigo-300 font-semibold mb-2 flex items-center gap-2 italic">
                Sema Nasi
              </h3>
              <p className="text-sm text-zinc-400">
                For the best Kenyan accent cloning, try to record your samples in a quiet room using a clear, conversational tone.
              </p>
            </div>
          </div>

          {/* Right Column - Studio */}
          <div className="lg:col-span-8">
            <VoiceStudio />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 bg-zinc-950 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs">© 2024 VoxClone Ke. Imetengenezwa kwa ajili ya binadamu.</p>
          <div className="flex gap-4 text-xs text-zinc-500">
            <a href="#" className="hover:text-zinc-300">Privacy</a>
            <a href="#" className="hover:text-zinc-300">Sheria na Masharti</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
