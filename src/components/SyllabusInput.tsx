import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Users, Accessibility, Sparkles, Loader2, Mic, Send, Bot, User, ChevronRight, Volume2, VolumeX, LogOut, Settings2, BrainCircuit, Zap, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import type { LearningStyle, BloomLevel, AIModel } from '../types/course';
import AIAssistantModel from './AIAssistantModel';

interface SyllabusInputProps {
  onGenerate: (input: string, options: {
    learningStyle: LearningStyle;
    classSize: number;
    accessibilityNeeds: string[];
    model: AIModel;
    creativity: number;
    bloomLevel: BloomLevel;
  }) => void;
  isLoading: boolean;
  userProfile: any;
  onRegister: (name: string) => void;
  onLogin: () => void;
  onLogout: () => void;
  isAuthenticated: boolean;
}

type Step = 'welcome' | 'name' | 'syllabus' | 'options';

export default function SyllabusInput({ onGenerate, isLoading, userProfile, onRegister, onLogin, onLogout, isAuthenticated }: SyllabusInputProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [professorName, setProfessorName] = useState('');
  const [input, setInput] = useState('');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>('textual');
  const [classSize, setClassSize] = useState(30);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);
  const [model, setModel] = useState<AIModel>('gemini-2.0-flash');
  const [creativity, setCreativity] = useState(0.7);
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>('apply');
  const [showChat, setShowChat] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (userProfile?.name) {
      setProfessorName(userProfile.name);
      setStep('name');
    }
  }, [userProfile]);
  
  // Voice States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Pre-load voices
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    // Split text into sentences for more natural pausing and inflection
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    let currentSentence = 0;
    
    const speakNext = () => {
      if (currentSentence >= sentences.length) {
        setIsSpeaking(false);
        return;
      }
      
      const sentenceText = sentences[currentSentence].trim();
      if (!sentenceText) {
        currentSentence++;
        speakNext();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentenceText);
      
      // Optimized parameters for a more "human" and "helpful" tone
      utterance.pitch = 1.06; // Slightly higher for a friendly, engaging tone
      utterance.rate = 0.92;  // Slightly slower for better clarity and "natural" feel
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      // Prioritize high-quality, natural-sounding voices
      const preferredVoice = voices.find(v => 
        v.name.includes('Natural') || 
        v.name.includes('Premium') || 
        v.name.includes('Google') || 
        v.name.includes('Samantha') ||
        v.name.includes('Female') ||
        v.lang.startsWith('en-US')
      ) || voices[0];
      
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        currentSentence++;
        // Add a small "breath" pause between sentences (250-500ms)
        const pauseTime = sentenceText.endsWith('?') ? 500 : 300;
        setTimeout(speakNext, pauseTime);
      };
      
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    };

    // Small initial delay to feel less "robotic"
    setTimeout(speakNext, 150);
  }, [voiceEnabled]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (step === 'welcome') {
        setProfessorName(transcript);
        setStep('name');
      } else if (step === 'syllabus') {
        setInput(transcript);
      }
    };

    recognition.start();
  }, [step]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChat(true);
      if (userProfile?.name) {
        speak(`Welcome back, Professor ${userProfile.name}! What's on your mind today? Are we building a new course or refining an existing syllabus?`);
      } else if (isAuthenticated) {
        speak("Great! You're signed in. Now, may I ask for your name so I can address you properly?");
      } else {
        speak("Hello! I'm your personal pedagogical assistant. To get started and save your progress, please sign in with your Google account.");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [speak, userProfile, isAuthenticated]);

  // Handle step changes for voice
  useEffect(() => {
    if (step === 'name' && professorName) {
      speak(`Welcome, Professor ${professorName}! It's a pleasure to assist you today. What's on your mind? Are we building a new course or refining an existing syllabus?`);
    } else if (step === 'syllabus') {
      speak("Excellent choice. Please provide the topics, syllabus, or learning objectives you'd like me to transform into a complete course package.");
    } else if (step === 'options') {
      speak("Almost there. How should I calibrate the learning experience? I can adapt the materials for different styles and class sizes.");
    }
  }, [step, professorName, speak]);

  const toggleAccessibility = (need: string) => {
    setAccessibilityNeeds(prev => 
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  const [loadingMessage, setLoadingMessage] = useState('Forging Course Materials...');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const messages = [
      'Analyzing pedagogical structure...',
      'Aligning with Bloom\'s Taxonomy...',
      'Sequencing reading materials...',
      'Calibrating quiz difficulty...',
      'Finalizing course package...'
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      setLoadingMessage(messages[i % messages.length]);
      i++;
    }, 3000);

    onGenerate(input, { 
      learningStyle, 
      classSize, 
      accessibilityNeeds,
      model,
      creativity,
      bloomLevel
    });
  };

  const handleTryExample = () => {
    setInput(`Course: Introduction to Sustainable Architecture
Target: 2nd Year Undergraduate Students

Topics:
1. History of Green Building
2. Passive Solar Design
3. Sustainable Materials & Life Cycle Assessment
4. Water Management Systems
5. Urban Heat Island Effect
6. LEED and BREEAM Certifications`);
    setStep('options');
  };

  const chatVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto h-[82vh] flex flex-col bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden relative">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-50 group-hover:scale-105 transition-transform">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">EduForge AI</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Pedagogical Core Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100">
            <button 
              onClick={startListening}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                isListening ? "text-emerald-600 bg-white shadow-sm ring-1 ring-emerald-100 animate-pulse" : "text-slate-400 hover:text-slate-600"
              )}
              title="Voice Chat"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                voiceEnabled ? "text-indigo-600 bg-white shadow-sm ring-1 ring-indigo-100" : "text-slate-400 hover:text-slate-600"
              )}
              title={voiceEnabled ? "Disable Voice" : "Enable Voice"}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-1" />
          <div className="flex items-center gap-3 pl-1">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
              {professorName ? professorName[0].toUpperCase() : <User className="w-5 h-5" />}
            </div>
            {isAuthenticated && (
              <button 
                onClick={onLogout}
                className="p-2.5 hover:bg-red-50 rounded-xl transition-all text-slate-400 hover:text-red-600 group"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth flex transition-all duration-1000 bg-slate-100/40",
        (step === 'welcome' || step === 'name') ? "flex-col items-center justify-center" : "flex-row items-start gap-12"
      )}>
        {/* Visual AI Model Container with Attached Speech Bubble */}
        <div className={cn(
          "flex transition-all duration-1000 items-center",
          (step === 'welcome' || step === 'name') ? "w-full justify-center mb-12 flex-col" : "w-[480px] justify-center pt-12 pb-12 sticky top-0 flex-row gap-4"
        )}>
          <AIAssistantModel 
            isSpeaking={isSpeaking} 
            isListening={isListening} 
            position={step === 'welcome' || step === 'name' ? 'center' : 'side'} 
          />
          
          <AnimatePresence mode="wait">
            {showChat && (
              <motion.div 
                key="chat-bubble"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                className={cn(
                  "relative p-6 rounded-[2rem] shadow-xl border border-slate-100 bg-white/90 backdrop-blur-md max-w-[300px]",
                  (step === 'welcome' || step === 'name') ? "mt-4 text-center" : "text-left"
                )}
              >
                {/* Speech Bubble Tail */}
                <div className={cn(
                  "absolute w-4 h-4 bg-white border-l border-t border-slate-100 rotate-[-45deg]",
                  (step === 'welcome' || step === 'name') ? "-top-2 left-1/2 -translate-x-1/2" : "-left-2 top-1/2 -translate-y-1/2"
                )} />
                
                <p className={cn(
                  "leading-relaxed font-medium text-slate-700",
                  (step === 'welcome' || step === 'name') ? "text-lg" : "text-sm"
                )}>
                  {step === 'welcome' && "Hello! I'm your pedagogical assistant. Please sign in to begin."}
                  {step === 'name' && `Welcome, Professor ${professorName}! Shall we build a new course?`}
                  {step === 'syllabus' && "Please provide your syllabus or topics below."}
                  {step === 'options' && "How should I calibrate the learning experience?"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={cn(
          "flex-1 transition-all duration-1000",
          (step === 'welcome' || step === 'name') ? "w-full max-w-3xl" : "max-w-4xl pt-8"
        )}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              {step === 'welcome' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="flex flex-col items-center gap-6"
                >
                  {!isAuthenticated ? (
                    <button 
                      onClick={onLogin}
                      className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] text-xl font-display font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/30 flex items-center gap-4 group active:scale-95"
                    >
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" referrerPolicy="no-referrer" />
                      </div>
                      Sign in with Google
                    </button>
                  ) : (
                    <div className="flex gap-3 bg-white p-3 rounded-[2.5rem] border border-slate-200 shadow-2xl w-full max-w-lg ring-8 ring-slate-50">
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Enter your name..."
                        value={professorName}
                        onChange={(e) => setProfessorName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && professorName && onRegister(professorName)}
                        className="flex-1 px-8 py-4 bg-transparent outline-none text-xl font-display font-bold text-slate-800 placeholder:text-slate-300"
                      />
                      <button 
                        onClick={() => professorName && onRegister(professorName)}
                        className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-90"
                      >
                        <ChevronRight className="w-8 h-8" />
                      </button>
                    </div>
                  )}
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Join 2,000+ educators forging the future of learning</p>
                </motion.div>
              )}

              {step === 'name' && (
                <div className="flex flex-col md:flex-row gap-6 justify-center">
                  <button 
                    onClick={() => setStep('syllabus')}
                    className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] text-lg font-display font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-4 active:scale-95"
                  >
                    <Sparkles className="w-6 h-6" />
                    Build New Course
                  </button>
                  <button 
                    onClick={handleTryExample}
                    className="px-10 py-5 bg-white border border-slate-200 rounded-[2rem] text-lg font-display font-black text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-lg flex items-center justify-center gap-4 active:scale-95"
                  >
                    <BookOpen className="w-6 h-6" />
                    Try Example
                  </button>
                </div>
              )}

              {step === 'syllabus' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full space-y-6"
                >
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-20 transition-opacity" />
                    <textarea
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Paste your syllabus, learning objectives, or core topics here..."
                      className="relative w-full h-64 p-8 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-2xl resize-none leading-relaxed text-lg text-slate-700 placeholder:text-slate-300"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => input.trim() && setStep('options')}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center gap-3"
                    >
                      Configure Experience
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'options' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full"
                >
                  <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-8">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-4">
                      <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      Learning Style
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {(['textual', 'visual', 'active'] as LearningStyle[]).map((style) => (
                        <button
                          key={style}
                          onClick={() => setLearningStyle(style)}
                          className={cn(
                            "px-4 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                            learningStyle === style 
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xl shadow-indigo-500/30 scale-105" 
                              : "bg-white text-slate-400 border-slate-50 hover:border-indigo-100 hover:text-slate-600"
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
                    <label className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-3">
                      <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <Users className="w-3 h-3" />
                      </div>
                      Class Size
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={classSize}
                        onChange={(e) => setClassSize(parseInt(e.target.value))}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-lg font-bold text-slate-700"
                        min="1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Students</span>
                    </div>
                  </div>

                  <div className="md:col-span-2 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center">
                          <Accessibility className="w-3 h-3" />
                        </div>
                        Accessibility Focus
                      </label>
                      <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.3em] transition-colors"
                      >
                        <Settings2 className={cn("w-4 h-4 transition-transform", showAdvanced && "rotate-180")} />
                        {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {['Screen Reader Friendly', 'Captions/Transcripts', 'Dyslexia Friendly', 'High Contrast'].map((need) => (
                        <button
                          key={need}
                          onClick={() => toggleAccessibility(need)}
                          className={cn(
                            "px-5 py-3 rounded-2xl text-xs font-bold transition-all border-2",
                            accessibilityNeeds.includes(need)
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                              : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                          )}
                        >
                          {need}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100 mt-6">
                            {/* Model Selection */}
                            <div className="space-y-4">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <BrainCircuit className="w-3 h-3" />
                                AI Model
                              </label>
                              <div className="flex flex-col gap-2">
                                {(['gemini-2.0-flash', 'gemini-2.0-pro-exp-02-05', 'gemini-2.0-flash-thinking-exp-01-21'] as AIModel[]).map((m) => (
                                  <button
                                    key={m}
                                    onClick={() => setModel(m)}
                                    className={cn(
                                      "px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 text-left",
                                      model === m 
                                        ? "bg-indigo-50 text-indigo-600 border-indigo-600" 
                                        : "bg-white text-slate-400 border-slate-50 hover:border-indigo-100"
                                    )}
                                  >
                                    {m.replace('gemini-2.0-', '').replace('-exp', '').replace('-', ' ')}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Creativity / Temperature */}
                            <div className="space-y-4">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Zap className="w-3 h-3" />
                                Creativity: {creativity.toFixed(1)}
                              </label>
                              <div className="px-2 pt-4">
                                <input 
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={creativity}
                                  onChange={(e) => setCreativity(parseFloat(e.target.value))}
                                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between mt-2">
                                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Precise</span>
                                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Creative</span>
                                </div>
                              </div>
                            </div>

                            {/* Bloom's Taxonomy */}
                            <div className="space-y-4">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <BarChart3 className="w-3 h-3" />
                                Pedagogical Depth
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'] as BloomLevel[]).map((level) => (
                                  <button
                                    key={level}
                                    onClick={() => setBloomLevel(level)}
                                    className={cn(
                                      "px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border-2",
                                      bloomLevel === level 
                                        ? "bg-indigo-50 text-indigo-600 border-indigo-600" 
                                        : "bg-white text-slate-400 border-slate-50 hover:border-indigo-100"
                                    )}
                                  >
                                    {level}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="md:col-span-2 flex justify-center pt-8">
                    <button
                      onClick={() => handleSubmit()}
                      disabled={isLoading}
                      className="w-full max-w-2xl py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-[0_20px_40px_-12px_rgba(79,70,229,0.4)] hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-4 group"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-7 h-7 animate-spin" />
                          {loadingMessage}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                          Forge Complete Course Package
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Status Only */}
      <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center gap-8">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <Bot className="w-3 h-3" />
          Gemini 2.0 Flash
        </p>
        <div className="w-1 h-1 bg-slate-200 rounded-full" />
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          Pedagogically Optimized
        </p>
      </div>
    </div>
  );
}
