/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Filter, Plus, ChevronRight, Clock, Database, X, Info, Activity, Layers, Share2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { collection, addDoc, query, orderBy, limit, getDocs, Timestamp, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// --- Types ---
interface ArchiveItem {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  intensity: number;
  createdAt?: any;
}

interface Scandal {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  sourceUrl: string;
  location?: string;
  createdAt: any;
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
  },
  {
    id: "ARC-004",
    title: "未送信の思慕",
    date: "2026.03.30",
    category: "Emotion",
    description: "下書きに留まり続けたメッセージ。送信ボタンを押せなかった指の震え。",
    intensity: 0.75
  },
  {
    id: "ARC-005",
    title: "静止した可能性",
    date: "2026.03.31",
    category: "Potential",
    description: "開かれなかった扉の向こう側。観測されることのなかった世界の断片。",
    intensity: 0.5
  }
];

// --- Components ---

function NewEntryModal({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (item: Omit<ArchiveItem, 'id'>) => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState(0.5);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[32px] p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF4E00] to-transparent opacity-50" />
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors opacity-40 hover:opacity-100">
          <X size={20} />
        </button>

        <h3 className="text-2xl font-serif mb-8 tracking-tight">New Archive Entry</h3>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 block">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF4E00]/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 block">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF4E00]/50 transition-colors appearance-none"
              >
                <option value="General">General</option>
                <option value="Communication">Communication</option>
                <option value="Decision">Decision</option>
                <option value="Action">Action</option>
                <option value="Emotion">Emotion</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 block">Intensity ({Math.round(intensity * 100)}%)</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#FF4E00] mt-4"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 block">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the inaction..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF4E00]/50 transition-colors resize-none"
            />
          </div>

          <button 
            onClick={() => {
              onSubmit({ title, category, description, intensity, date: new Date().toLocaleDateString('ja-JP').replace(/\//g, '.') });
              onClose();
            }}
            className="w-full bg-[#FF4E00] hover:bg-[#FF6321] text-white font-bold uppercase tracking-[0.2em] text-xs py-4 rounded-xl transition-all shadow-lg shadow-[#FF4E00]/20"
          >
            Archive Entry
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ScandalDB() {
  console.log("ScandalDB component rendered");
  const [scandals, setScandals] = useState<Scandal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollecting, setIsCollecting] = useState(false);
  const isCollectingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  // Gemini Setup
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }), []);

  const collectScandals = async () => {
    if (isCollectingRef.current) return;
    isCollectingRef.current = true;
    setIsCollecting(true);
    setError(null);
    try {
      const currentDate = new Date().toLocaleDateString('ja-JP');
      console.log(`AI is collecting latest scandals from frontend... (Current Date: ${currentDate})`);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `本日（${currentDate}）時点での、日本の行政機関、地方自治体、または公務員による最新の不祥事ニュース（汚職、横領、ハラスメント、情報漏洩、不適切な公務執行など）を、重複なく、必ず正確に15件リストアップしてください。
各項目には以下の情報を含めてください：
- title: ニュースのタイトル（具体的かつ正確に）
- date: 発生または報道された日付（YYYY/MM/DD形式）
- category: "Administrative"（組織的・行政的）または "Personal"（個人的な非行）
- description: 150文字以上の詳細な概要（背景、内容、現在の状況を含む）
- sourceUrl: ニュースソースのURL（実在する信頼できるニュースサイトのURL）
- location: 発生した都道府県や市区町村

必ず有効なJSON配列形式で出力してください。`,
        config: {
          systemInstruction: "あなたは日本の行政・公務員不祥事を記録する専門のシニア・アーキビストです。Google検索ツールを使用して、本日時点での最新かつ正確な報道情報を収集してください。客観的な事実に基づき、感情的な表現を避けて記録してください。必ず指定されたJSONフォーマットを守り、15件のデータを生成してください。重複を避け、実在するニュースのみを扱ってください。",
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            minItems: 15,
            maxItems: 15,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                date: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Administrative", "Personal"] },
                description: { type: Type.STRING },
                sourceUrl: { type: Type.STRING },
                location: { type: Type.STRING }
              },
              required: ["title", "date", "category", "description", "sourceUrl", "location"]
            }
          }
        }
      });

      if (!response.text) throw new Error('AI response is empty');
      
      const collectedScandals = JSON.parse(response.text);
      const scandalsCollection = collection(db, "scandals");

      let addedCount = 0;
      // Store in Firestore
      for (const scandal of collectedScandals) {
        const q = query(scandalsCollection, where("title", "==", scandal.title));
        const existing = await getDocs(q);
        
        if (existing.empty) {
          await addDoc(scandalsCollection, {
            ...scandal,
            createdAt: Timestamp.now()
          });
          addedCount++;
        }
      }
      console.log(`Successfully added ${addedCount} new scandals to Firestore.`);
    } catch (err) {
      console.error("Failed to collect scandals:", err);
      
      // Fallback to mock data if AI fails, but check for duplicates even here
      const scandalsCollection = collection(db, "scandals");
      const fallbackScandals = Array.from({ length: 10 }).map((_, i) => ({
        title: `[AI収集制限中] システムによる代替表示 第${Date.now()}-${i + 1}号`,
        date: new Date().toLocaleDateString('ja-JP'),
        category: i % 2 === 0 ? "Administrative" : "Personal",
        description: "現在、AIによるリアルタイムニュース収集が一時的に制限されているか、最新のニュースが見つかりませんでした。このデータはシステムによる整合性維持のための代替表示です。行政の透明性と公務員の倫理観を再考するための記録として保持されます。",
        sourceUrl: "https://www.google.com/search?q=公務員+不祥事+ニュース",
        location: "全国",
        createdAt: Timestamp.now()
      }));

      for (const scandal of fallbackScandals) {
        const q = query(scandalsCollection, where("title", "==", scandal.title));
        const existing = await getDocs(q);
        if (existing.empty) {
          await addDoc(scandalsCollection, scandal);
        }
      }
      
      setError('AIによるニュース収集に不安定な挙動が見られました。システムによる代替データを生成しました。');
    } finally {
      isCollectingRef.current = false;
      setIsCollecting(false);
    }
  };

  useEffect(() => {
    const scandalsCollection = collection(db, "scandals");
    const q = query(scandalsCollection, orderBy("createdAt", "desc"), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scandal));
      setScandals(data);
      setIsLoading(false);
      
      // Auto-collect if empty or fewer than 10
      if (data.length < 10 && !isCollectingRef.current) {
        console.log(`Current data count (${data.length}) is less than 10. Triggering AI collection...`);
        collectScandals();
      }
    }, (err) => {
      console.error("Firestore Error:", err);
      setError('データベースの読み込みに失敗しました。');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h3 className="text-3xl font-serif mb-2 tracking-tight">不祥事データベース</h3>
          <p className="text-xs text-white/40 tracking-[0.2em] uppercase font-bold">AIによる行政・公務員不祥事の自動収集システム</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
            <div className={`w-2 h-2 rounded-full ${isCollecting ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest">
              {isCollecting ? 'AI COLLECTING' : 'SYSTEM READY'}
            </span>
          </div>
          <button 
            onClick={collectScandals}
            disabled={isCollecting}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
              isCollecting 
              ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed' 
              : 'bg-[#FF4E00] hover:bg-[#FF6321] border-[#FF4E00] shadow-lg shadow-[#FF4E00]/20'
            }`}
          >
            <Activity size={16} className={isCollecting ? 'animate-spin' : ''} />
            {isCollecting ? 'AI収集実行中...' : '最新ニュースをAI収集'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {error && (
          <div className="p-8 rounded-[32px] bg-red-500/10 border border-red-500/20 text-red-400 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} />
              <span className="text-sm font-bold">{error}</span>
            </div>
            <button 
              onClick={() => collectScandals()}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              再試行
            </button>
          </div>
        )}

        {(isLoading || (isCollecting && scandals.length === 0)) ? (
          // Skeleton Loaders
          Array.from({ length: 10 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 animate-pulse">
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-4 bg-white/5 rounded-full" />
                <div className="w-24 h-4 bg-white/5 rounded-full" />
              </div>
              <div className="w-3/4 h-8 bg-white/5 rounded-xl mb-4" />
              <div className="w-full h-4 bg-white/5 rounded-lg mb-2" />
              <div className="w-2/3 h-4 bg-white/5 rounded-lg" />
            </div>
          ))
        ) : scandals.length > 0 ? (
          <>
            {isCollecting && (
              <div className="flex items-center gap-3 px-8 py-4 bg-[#FF4E00]/10 border border-[#FF4E00]/20 rounded-2xl mb-6 animate-pulse">
                <Activity size={14} className="text-[#FF4E00] animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4E00]">最新データを収集中... しばらくお待ちください</span>
              </div>
            )}
            {scandals.map((scandal, index) => (
              <motion.div
                key={scandal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-[#FF4E00]/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                      scandal.category === 'Administrative' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {scandal.category}
                    </span>
                    <span className="text-[10px] font-mono opacity-40">{scandal.date}</span>
                    {scandal.location && (
                      <span className="text-[10px] font-mono opacity-40 flex items-center gap-1">
                        <Info size={10} /> {scandal.location}
                      </span>
                    )}
                  </div>
                  <a 
                    href={scandal.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-[#FF4E00] transition-all flex items-center gap-2"
                  >
                    <Share2 size={12} /> Source
                  </a>
                </div>
                <h4 className="text-2xl font-serif mb-4 group-hover:text-[#FF4E00] transition-colors">{scandal.title}</h4>
                <p className="text-sm text-white/50 leading-relaxed font-light mb-6">{scandal.description}</p>
                <div className="flex items-center gap-2 text-[8px] font-mono opacity-20 uppercase tracking-widest">
                  <Clock size={10} /> Collected at: {new Date(scandal.createdAt?.seconds * 1000).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </>
        ) : (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-[32px] bg-white/[0.01] group">
            <Database size={48} className="mx-auto mb-6 text-white/20 group-hover:text-[#FF4E00] transition-colors" />
            <h4 className="text-xl font-serif mb-4">データベースが空です</h4>
            <p className="text-sm text-white/40 mb-8 max-w-md mx-auto">
              現在、表示できる不祥事データがありません。AIによる自動収集を開始して、最新の10件を掲載してください。
            </p>
            <button 
              onClick={collectScandals}
              className="px-10 py-4 bg-[#FF4E00] hover:bg-[#FF6321] text-white font-bold uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-lg shadow-[#FF4E00]/20"
            >
              AI収集を開始する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Visualization() {
  const nodes = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    speed: Math.random() * 0.5 + 0.2,
    offset: Math.random() * Math.PI * 2
  })), []);

  return (
    <div className="h-[70vh] w-full bg-white/[0.01] border border-white/5 rounded-[40px] relative overflow-hidden group">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Floating Particles */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <radialGradient id="particleGradient">
            <stop offset="0%" stopColor="#FF4E00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF4E00" stopOpacity="0" />
          </radialGradient>
        </defs>
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            r={node.size}
            fill="url(#particleGradient)"
            animate={{
              cx: [`${node.x}%`, `${(node.x + 10) % 100}%`, `${node.x}%`],
              cy: [`${node.y}%`, `${(node.y + 15) % 100}%`, `${node.y}%`],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 10 / node.speed,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
        
        {/* Connections */}
        {nodes.slice(0, 15).map((node, i) => {
          const nextNode = nodes[(i + 1) % nodes.length];
          return (
            <motion.line
              key={`line-${i}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${nextNode.x}%`}
              y2={`${nextNode.y}%`}
              stroke="#FF4E00"
              strokeWidth="0.5"
              strokeOpacity="0.1"
              animate={{
                x1: [`${node.x}%`, `${(node.x + 10) % 100}%`, `${node.x}%`],
                y1: [`${node.y}%`, `${(node.y + 15) % 100}%`, `${node.y}%`],
                x2: [`${nextNode.x}%`, `${(nextNode.x + 10) % 100}%`, `${nextNode.x}%`],
                y2: [`${nextNode.y}%`, `${(nextNode.y + 15) % 100}%`, `${nextNode.y}%`],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-[#FF4E00] blur-[100px] rounded-full"
          />
          <Database size={64} className="text-[#FF4E00] relative z-10 mb-8" />
        </div>
        <h3 className="text-3xl font-serif mb-4 tracking-tight relative z-10">Inaction Mass Visualization</h3>
        <p className="text-xs text-white/40 tracking-[0.4em] uppercase font-bold relative z-10">Mapping the Unseen Potential</p>
        
        <div className="mt-16 flex gap-12 relative z-10">
          <div className="text-center">
            <div className="text-2xl font-mono text-white mb-1">1,248</div>
            <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Total Inactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-[#FF4E00] mb-1">84.2%</div>
            <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Accumulated Mass</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-white mb-1">24.5TB</div>
            <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Silent Data</div>
          </div>
        </div>
      </div>

      {/* Interactive Elements */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#FF4E00] animate-pulse" />
            <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest">Real-time Stream Active</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-8 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ x: [-32, 32] }}
                  transition={{ duration: 1 + i * 0.5, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full bg-[#FF4E00]/40"
                />
              </div>
            ))}
          </div>
        </div>
        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all backdrop-blur-md">
          Export Visualization
        </button>
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  console.log("App component rendered");
  const [isMounted, setIsMounted] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);
  const [activeTab, setActiveTab] = useState<'archive' | 'visualize' | 'scandal'>('scandal');
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsMounted(true);
    
    // Real-time Archive items
    const archiveCollection = collection(db, "archive");
    const q = query(archiveCollection, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArchiveItem));
      
      // Seed if empty
      if (data.length === 0) {
        console.log("Seeding initial archive data...");
        for (const item of MOCK_DATA) {
          const { id, ...rest } = item;
          await addDoc(archiveCollection, {
            ...rest,
            createdAt: Timestamp.now()
          });
        }
      }
      
      setArchiveItems(data);
      if (data.length > 0 && !selectedItem) {
        setSelectedItem(data[0]);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredItems = useMemo(() => {
    return archiveItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [archiveItems, searchQuery]);

  const handleAddEntry = async (newItem: Omit<ArchiveItem, 'id'>) => {
    try {
      const archiveCollection = collection(db, "archive");
      await addDoc(archiveCollection, {
        ...newItem,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error adding archive entry:", error);
    }
  };

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
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setActiveTab('archive')}
            >
              <div className="w-8 h-8 bg-[#FF4E00] rounded-lg flex items-center justify-center">
                <Layers size={18} className="text-white" />
              </div>
              <h1 className="text-lg font-serif tracking-[0.2em] font-light uppercase">
                Inaction <span className="text-[#FF4E00]">Archive</span>
              </h1>
            </motion.div>
            
            <div className="hidden md:flex items-center gap-8 text-[10px] tracking-[0.3em] font-bold uppercase opacity-40">
              <button 
                onClick={() => setActiveTab('archive')}
                className={`hover:opacity-100 transition-all relative py-2 ${activeTab === 'archive' ? 'opacity-100 text-[#FF4E00]' : ''}`}
              >
                Archive
                {activeTab === 'archive' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#FF4E00]" />}
              </button>
              <button 
                onClick={() => setActiveTab('visualize')}
                className={`hover:opacity-100 transition-all relative py-2 ${activeTab === 'visualize' ? 'opacity-100 text-[#FF4E00]' : ''}`}
              >
                Visualize
                {activeTab === 'visualize' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#FF4E00]" />}
              </button>
              <button 
                onClick={() => setActiveTab('scandal')}
                className={`hover:opacity-100 transition-all relative py-2 ${activeTab === 'scandal' ? 'opacity-100 text-[#FF4E00]' : ''}`}
              >
                Scandal DB
                {activeTab === 'scandal' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#FF4E00]" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 focus-within:border-[#FF4E00]/50 transition-colors">
              <Search size={14} className="opacity-40 mr-2" />
              <input 
                type="text" 
                placeholder="Search archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest w-32 focus:w-48 transition-all"
              />
            </div>
            <button 
              onClick={() => setIsNewEntryModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-full transition-all border border-white/10 flex items-center gap-2 group"
            >
              <Plus size={14} className="group-hover:rotate-90 transition-transform" />
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
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">System Online / {activeTab === 'archive' ? 'Browsing Records' : 'Visualizing Mass'}</span>
            </div>
            <h2 className="text-6xl md:text-9xl font-serif font-light leading-[0.85] mb-10 tracking-tighter">
              {activeTab === 'archive' ? (
                <>不作為可視化<br /><span className="italic opacity-30">アーカイブ</span></>
              ) : activeTab === 'visualize' ? (
                <>不在の質量<br /><span className="italic opacity-30">可視化エンジン</span></>
              ) : (
                <>不祥事<br /><span className="italic opacity-30">データベース</span></>
              )}
            </h2>
            <p className="text-xl md:text-2xl text-white/50 max-w-3xl font-light leading-relaxed">
              {activeTab === 'archive' ? (
                "なされなかった行動、語られなかった言葉、選ばれなかった未来。それら「不在」の集積を記録し、その質量を可視化する試み。"
              ) : activeTab === 'visualize' ? (
                "蓄積された不作為のデータを解析し、目に見えない「可能性の残滓」を空間的な質量として再構成します。"
              ) : (
                "AIによって全国のニュースから収集された、行政機関および公務員による不祥事の記録。社会の「不在」の一側面としての不祥事をDB化。"
              )}
            </p>
          </motion.div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'archive' ? (
            <motion.div 
              key="archive-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-16"
            >
              {/* Archive List */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between mb-10 opacity-40">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Records Found: {filteredItems.length}</span>
                    <div className="h-4 w-[1px] bg-white/20" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Sorting: Newest First</span>
                  </div>
                  <div className="flex gap-6">
                    <button className="hover:text-[#FF4E00] transition-colors"><Filter size={16} /></button>
                    <button className="hover:text-[#FF4E00] transition-colors"><Share2 size={16} /></button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedItem(item)}
                      className={`group relative p-10 rounded-[32px] border transition-all cursor-pointer overflow-hidden ${
                        selectedItem?.id === item.id 
                        ? 'bg-white/5 border-[#FF4E00]/50 shadow-2xl shadow-[#FF4E00]/5' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                      }`}
                    >
                      {selectedItem?.id === item.id && (
                        <motion.div 
                          layoutId="active-bg"
                          className="absolute inset-0 bg-gradient-to-br from-[#FF4E00]/5 to-transparent pointer-events-none"
                        />
                      )}
                      
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-[10px] font-mono text-[#FF4E00] tracking-widest">{item.id}</span>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{item.category}</span>
                          </div>
                          <h3 className="text-3xl font-serif tracking-tight group-hover:text-[#FF4E00] transition-colors">{item.title}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono opacity-40 block mb-1">{item.date}</span>
                          <div className="flex gap-1 justify-end">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-1 h-3 rounded-full ${i < Math.round(item.intensity * 5) ? 'bg-[#FF4E00]' : 'bg-white/10'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-base text-white/40 line-clamp-2 mb-8 font-light leading-relaxed relative z-10">{item.description}</p>
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex gap-4">
                          <button className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
                            <Info size={12} /> View Details
                          </button>
                          <button className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
                            <Activity size={12} /> Analyze
                          </button>
                        </div>
                        <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-2 text-[#FF4E00]" />
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredItems.length === 0 && (
                    <div className="py-24 text-center border border-dashed border-white/10 rounded-[32px] opacity-40">
                      <Search size={32} className="mx-auto mb-4" />
                      <p className="text-sm uppercase tracking-widest font-bold">No records found matching your query</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar / Detail */}
              <div className="lg:col-span-5">
                <div className="sticky top-32 space-y-8">
                  <AnimatePresence mode="wait">
                    {selectedItem ? (
                      <motion.div
                        key={selectedItem.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-12 rounded-[40px] bg-white/[0.03] border border-white/10 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                          <Database size={200} />
                        </div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-[#FF4E00]/10 border border-[#FF4E00]/20 flex items-center justify-center">
                              <Activity size={24} className="text-[#FF4E00]" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF4E00] mb-1">Analysis Report</h4>
                              <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">ID: {selectedItem.id}</span>
                            </div>
                          </div>

                          <h3 className="text-4xl font-serif mb-6 leading-tight">{selectedItem.title}</h3>
                          
                          <p className="text-lg leading-relaxed text-white/60 mb-10 font-light italic border-l-2 border-[#FF4E00]/30 pl-6">
                            "{selectedItem.description}"
                          </p>

                          <div className="grid grid-cols-2 gap-8 mb-10">
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Category</span>
                              <div className="text-sm font-mono">{selectedItem.category}</div>
                            </div>
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Timestamp</span>
                              <div className="text-sm font-mono">{selectedItem.date}</div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Inaction Intensity</span>
                              <span className="text-2xl font-mono text-[#FF4E00]">{Math.round(selectedItem.intensity * 100)}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${selectedItem.intensity * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-[#FF4E00]/50 to-[#FF4E00]" 
                              />
                            </div>
                            <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-wider font-bold">
                              This value represents the potential energy lost due to the absence of action or speech in this specific context.
                            </p>
                          </div>

                          <div className="mt-12 pt-12 border-t border-white/5 flex gap-4">
                            <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                              Download Data
                            </button>
                            <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
                              <Share2 size={18} className="opacity-60" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="p-12 rounded-[40px] border border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-30 h-[400px]">
                        <Layers size={48} className="mb-6" />
                        <p className="text-sm uppercase tracking-widest font-bold">Select a record to view analysis</p>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* System Status Card */}
                  <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Archive Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] font-mono text-green-500">SYNCED</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-mono opacity-40">
                        <span>Database Load</span>
                        <span>12%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[12%] bg-white/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'visualize' ? (
            <motion.div 
              key="visualize-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Visualization />
            </motion.div>
          ) : (
            <motion.div 
              key="scandal-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ScandalDB />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-20 px-6 mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#FF4E00] rounded-xl flex items-center justify-center">
                  <Layers size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-serif tracking-[0.2em] font-light uppercase">
                  Inaction <span className="text-[#FF4E00]">Archive</span> <span className="text-[10px] bg-[#FF4E00] text-white px-2 py-1 rounded ml-2">v2.1</span>
                </h1>
              </div>
              <p className="text-white/40 max-w-md font-light leading-relaxed mb-8">
                The Inaction Visualization Archive is a research project dedicated to mapping the unseen landscape of human non-action. By quantifying what didn't happen, we reveal the true shape of our choices.
              </p>
              <div className="text-[8px] font-mono opacity-20 uppercase tracking-widest mb-8">
                System Version: 2.1.0-STABLE / Build: 20260331
              </div>
              <div className="flex gap-6 opacity-40">
                <Share2 size={20} className="hover:text-[#FF4E00] cursor-pointer transition-colors" />
                <Database size={20} className="hover:text-[#FF4E00] cursor-pointer transition-colors" />
                <Info size={20} className="hover:text-[#FF4E00] cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 opacity-40">Navigation</h5>
              <ul className="space-y-4 text-sm font-light text-white/60">
                <li><button onClick={() => setActiveTab('archive')} className="hover:text-[#FF4E00] transition-colors">Archive Gallery</button></li>
                <li><button onClick={() => setActiveTab('visualize')} className="hover:text-[#FF4E00] transition-colors">Visualization Engine</button></li>
                <li><button onClick={() => setActiveTab('scandal')} className="hover:text-[#FF4E00] transition-colors">Scandal Database</button></li>
                <li><a href="#" className="hover:text-[#FF4E00] transition-colors">Research Papers</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 opacity-40">Legal & System</h5>
              <ul className="space-y-4 text-sm font-light text-white/60">
                <li><a href="#" className="hover:text-[#FF4E00] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#FF4E00] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#FF4E00] transition-colors">API Documentation</a></li>
                <li className="flex items-center gap-2 text-[#FF4E00] font-mono text-[10px] tracking-widest">
                  <Clock size={12} /> {new Date().getFullYear()} ARCHIVE SYSTEM
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-20">
            <span className="text-[10px] font-mono tracking-widest uppercase">© 2026 Inaction Visualization Archive / All Rights Reserved</span>
            <span className="text-[10px] font-mono tracking-widest uppercase">System Status: Optimal / Node: {window.location.hostname}</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isNewEntryModalOpen && (
          <NewEntryModal 
            isOpen={isNewEntryModalOpen} 
            onClose={() => setIsNewEntryModalOpen(false)} 
            onSubmit={handleAddEntry}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
