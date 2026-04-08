import React, { useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AIAssistantModelProps {
  isSpeaking: boolean;
  isListening: boolean;
  position: 'center' | 'side';
}

export default function AIAssistantModel({ isSpeaking, isListening, position }: AIAssistantModelProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (isSpeaking) {
      controls.start({
        scaleY: [1, 1.4, 1],
        transition: { repeat: Infinity, duration: 0.15 }
      });
    } else {
      controls.stop();
      controls.set({ scaleY: 1 });
    }
  }, [isSpeaking, controls]);

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        scale: position === 'center' ? 0.8 : 0.5,
      }}
      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      className="relative flex flex-col items-center justify-center pointer-events-none select-none p-4"
    >
      {/* Dynamic Glow Aura */}
      <div className={cn(
        "absolute inset-0 blur-[30px] rounded-full transition-all duration-1000 opacity-10",
        isSpeaking ? "bg-indigo-500" : isListening ? "bg-emerald-500" : "bg-blue-400"
      )} />

      {/* Floating Animation Wrapper */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          rotate: isSpeaking ? [0, -0.5, 0.5, 0] : [0, 0.5, -0.5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Sleek Orb Assistant */}
        <div className="relative w-24 h-24">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-200 rounded-full border border-slate-300/50 shadow-2xl z-20 overflow-hidden ring-1 ring-white/80"
          >
            {/* Glass Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/40 pointer-none" />
            
            {/* Face Screen */}
            <div className="absolute inset-2 bg-slate-950 rounded-full flex flex-col items-center justify-center gap-2 overflow-hidden border border-slate-800/50">
              {/* Data Grid Background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '8px 8px' }} 
              />
              
              {/* Professional Visor Eyes */}
              <div className="flex gap-4 relative z-10">
                <motion.div 
                  animate={{ 
                    width: isSpeaking ? [12, 16, 12] : 10,
                    height: isSpeaking ? 1.5 : 1,
                    opacity: isListening ? [0.6, 1, 0.6] : 0.8,
                    backgroundColor: isListening ? '#34d399' : isSpeaking ? '#818cf8' : '#6366f1'
                  }}
                  transition={{ repeat: Infinity, duration: isSpeaking ? 0.3 : 3 }}
                  className="bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                />
                <motion.div 
                  animate={{ 
                    width: isSpeaking ? [12, 16, 12] : 10,
                    height: isSpeaking ? 1.5 : 1,
                    opacity: isListening ? [0.6, 1, 0.6] : 0.8,
                    backgroundColor: isListening ? '#34d399' : isSpeaking ? '#818cf8' : '#6366f1'
                  }}
                  transition={{ repeat: Infinity, duration: isSpeaking ? 0.3 : 3 }}
                  className="bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                />
              </div>
              
              {/* Refined Voice Waveform */}
              <div className="flex items-center gap-0.5 h-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div 
                    key={i}
                    animate={isSpeaking ? { 
                      height: [2, 10, 2],
                      opacity: [0.3, 1, 0.3]
                    } : { 
                      height: 1,
                      opacity: 0.2 
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.4, 
                      delay: i * 0.08,
                      ease: "easeInOut"
                    }}
                    className="w-[1.5px] bg-indigo-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Professional Shadow/Light */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-indigo-500/5 rounded-full blur-lg animate-pulse" />
        </div>
      </motion.div>

      {/* Minimal Voice Status */}
      <AnimatePresence>
        {(isSpeaking || isListening) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-4 px-2 py-1 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-md flex items-center gap-1.5"
          >
            <div className="flex gap-0.5">
              <motion.div
                animate={{ scale: isSpeaking ? [1, 1.2, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isSpeaking ? "bg-indigo-500" : "bg-emerald-500"
                )}
              />
            </div>
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">
              {isSpeaking ? 'Active' : 'Listening'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
