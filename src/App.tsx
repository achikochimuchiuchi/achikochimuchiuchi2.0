/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Copy, Check, Info, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const folderName = "不作為可視化アーカイブ";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(folderName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Header */}
      <header className="border-b border-black/10 py-6 px-4 md:px-8 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <h1 className="text-sm uppercase tracking-widest font-semibold opacity-60">
            Guide / Archive
          </h1>
          <div className="flex items-center gap-4 text-xs font-medium opacity-40">
            <span>VER. 1.0.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <section className="mb-16">
            <h2 className="text-4xl md:text-6xl font-serif font-light leading-tight mb-8">
              不作為可視化アーカイブ<br />
              <span className="italic text-2xl md:text-3xl opacity-40">Inaction Visualization Archive</span>
            </h2>
            <p className="text-lg leading-relaxed opacity-70 max-w-2xl">
              このページは、特定のフォルダ名を正確に取得するためのガイドです。
              以下のボタンをクリックして、フォルダ名をクリップボードにコピーしてください。
            </p>
          </section>

          {/* Copy Section */}
          <section className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-black/5 mb-12">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 text-[#5A5A40]">
                <Info size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Target Folder Name</span>
              </div>
              
              <div className="relative group">
                <div className="w-full bg-[#f5f5f0] rounded-2xl p-6 md:p-8 text-2xl md:text-4xl font-serif text-center border border-transparent group-hover:border-[#5A5A40]/20 transition-all duration-500">
                  {folderName}
                </div>
                
                <button
                  onClick={handleCopy}
                  className="mt-8 w-full bg-[#5A5A40] hover:bg-[#4a4a35] text-white rounded-full py-4 px-8 flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-[#5A5A40]/20"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check size={20} />
                        <span className="font-medium">コピーしました</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Copy size={20} />
                        <span className="font-medium">フォルダ名をコピー</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </section>

          {/* Instructions */}
          <section className="grid md:grid-cols-2 gap-8 mb-24">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Usage / 使い方</h3>
              <ul className="space-y-3 text-sm leading-relaxed opacity-70">
                <li className="flex gap-3">
                  <span className="font-serif italic opacity-40">01.</span>
                  <span>上のボタンを押して名前をコピーします。</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif italic opacity-40">02.</span>
                  <span>作成したい場所で「新しいフォルダ」を作成します。</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif italic opacity-40">03.</span>
                  <span>名前を貼り付けて（Ctrl+V / Cmd+V）保存します。</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Notes / 注意事項</h3>
              <p className="text-sm leading-relaxed opacity-70">
                文字化けや誤字を防ぐため、手入力ではなく必ずコピー機能を使用してください。
                Vercelでの表示に問題がある場合は、ブラウザのキャッシュをクリアして再読み込みをお試しください。
              </p>
            </div>
          </section>
        </motion.div>
      </main>

      <footer className="border-t border-black/5 py-12 px-4 md:px-8 opacity-40">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] tracking-widest uppercase font-bold">
          <p>© 2026 不作為可視化アーカイブ</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[#5A5A40] transition-colors flex items-center gap-1">
              GitHub <ExternalLink size={10} />
            </a>
            <a href="#" className="hover:text-[#5A5A40] transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
