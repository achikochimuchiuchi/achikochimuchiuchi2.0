/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Plus, ChevronRight, Clock, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ArchiveItem {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  intensity: number;
}

const MOCK_DATA: ArchiveItem[] = [
  {
    id: "ARC-001",
    title: "沈黙の選択",
    date: "2026.03.15",
    category: "Communication",
    description: "伝えるべき言葉を飲み込んだ瞬間。その空白がもたらした静寂の記録。",
    intensity: 0.8
  },
  {
    id: "ARC-002",
    title: "未踏の分岐点",
    date: "2026.03.20",
    category: "Decision",
    description: "選ばれなかった道。歩まれなかった歩数。存在しない足跡の可視化。",
    intensity: 0.6
  },
  {
    id: "ARC-003",
    title: "保留された意志",
    date: "2026.03.28",
    category: "Action",
    description: "「明日」へと先送りされた決意。蓄積される時間の重力。",
    intensity: 0.9
  }
];

export default function App() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);
  const [activeTab, setActiveTab] = useState<'archive' | 'visualize'>('archive');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans selection:bg-[#FF4E00] selection:text-white overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF4E00]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#3a1510]/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-lg font-serif tracking-[0.2em] font-light uppercase">
              Inaction <span className="text-[#FF4E00]">Archive</span>
            </h1>
            <div className="hidden md:flex items-center gap-6 text-[10px] tracking-widest font-bold uppercase opacity-40">
              <button 
                onClick={() => setActiveTab('archive')}
                className={`hover:opacity-100 transition-opacity ${activeTab === 'archive' ? 'opacity-100 text-[#FF4E00]' : ''}`}
              >
                Archive
              </button>
              <button 
                onClick={() => setActiveTab('visualize')}
                className={`hover:opacity-100 transition-opacity ${activeTab === 'visualize' ? 'opacity-100 text-[#FF4E00]' : ''}`}
              >
                Visualize
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-60">
              <Search size={18} />
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all border border-white/10">
              New Entry
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <header className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-6 opacity-40">
              <div className="h-[1px] w-12 bg-current" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">System Online / Data Loading</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-serif font-light leading-[0.9] mb-8 tracking-tighter">
              不作為可視化<br />
              <span className="italic opacity-30">アーカイブ</span>
            </h2>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl font-light leading-relaxed">
              なされなかった行動、語られなかった言葉、選ばれなかった未来。<br />
              それら「不在」の集積を記録し、その質量を可視化する試み。
            </p>
          </motion.div>
        </header>

        {activeTab === 'archive' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Archive List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between mb-8 opacity-40">
                <span className="text-[10px] font-bold uppercase tracking-widest">Recent Records</span>
                <div className="flex gap-4">
                  <Filter size={14} />
                  <Database size={14} />
                </div>
              </div>
              
              {MOCK_DATA.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative p-8 rounded-2xl border transition-all cursor-pointer ${
                    selectedItem?.id === item.id 
                    ? 'bg-white/5 border-[#FF4E00]/50' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#FF4E00] mb-2 block">{item.id}</span>
                      <h3 className="text-2xl font-serif">{item.title}</h3>
                    </div>
                    <span className="text-[10px] font-mono opacity-40">{item.date}</span>
                  </div>
                  <p className="text-sm text-white/40 line-clamp-2 mb-6 font-light">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 opacity-60 uppercase tracking-widest">
                      {item.category}
                    </span>
                    <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sidebar / Detail */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                {/* Selected Item Detail */}
                <AnimatePresence mode="wait">
                  {selectedItem && (
                    <motion.div
                      key={selectedItem.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-8 rounded-3xl bg-white/[0.02] border border-white/5"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#FF4E00] mb-4">Details</h4>
                      <p className="text-sm leading-relaxed text-white/70 mb-6 italic">
                        "{selectedItem.description}"
                      </p>
                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-40">
                          <span>Intensity</span>
                          <span>{selectedItem.intensity * 100}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedItem.intensity * 100}%` }}
                            className="h-full bg-[#FF4E00]" 
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[60vh] flex flex-col items-center justify-center border border-white/5 rounded-[40px] bg-white/[0.01] relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-[400px] h-[400px] border border-dashed border-[#FF4E00] rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-[300px] h-[300px] border border-dashed border-white/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            </div>
            <Database size={48} className="text-[#FF4E00] mb-6 animate-pulse" />
            <h3 className="text-2xl font-serif mb-2">Visualization Engine</h3>
            <p className="text-sm text-white/40 tracking-widest uppercase">Processing Inaction Data...</p>
            <div className="mt-12 grid grid-cols-10 gap-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: [10, Math.random() * 40 + 10, 10],
                    opacity: [0.2, 0.6, 0.2]
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2, 
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                  className="w-1 bg-[#FF4E00] rounded-full"
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-12 px-6 opacity-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <Clock size={14} />
            <span className="text-[10px] font-mono tracking-widest">SYSTEM TIME: {new Date().toISOString()}</span>
          </div>
          <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-[#FF4E00] transition-colors">Documentation</a>
            <a href="#" className="hover:text-[#FF4E00] transition-colors">API Access</a>
            <a href="#" className="hover:text-[#FF4E00] transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
