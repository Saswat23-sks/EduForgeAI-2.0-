import React, { useState, useEffect } from 'react';
import { generateCourse } from './services/gemini';
import type { Course, LearningStyle, Module, AIModel, BloomLevel } from './types/course';
import SyllabusInput from './components/SyllabusInput';
import ModuleSidebar from './components/ModuleSidebar';
import ArtifactViewer from './components/ArtifactViewer';
import { Sparkles, ArrowLeft, Loader2, LogOut } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<string | null>(null);
  const [generationOptions, setGenerationOptions] = useState<{
    learningStyle: LearningStyle;
    classSize: number;
    accessibilityNeeds: string[];
    model: AIModel;
    creativity: number;
    bloomLevel: BloomLevel;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setProfile(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleRegister = async (name: string) => {
    if (!user) return;
    const newProfile = {
      uid: user.uid,
      name,
      email: user.email || 'user@eduforge.ai',
      createdAt: serverTimestamp()
    };
    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleGenerate = async (input: string, options: {
    learningStyle: LearningStyle;
    classSize: number;
    accessibilityNeeds: string[];
    model: AIModel;
    creativity: number;
    bloomLevel: BloomLevel;
  }) => {
    setIsLoading(true);
    setGenerationOptions(options);
    try {
      const generatedCourse = await generateCourse(input, options);
      setCourse(generatedCourse);
      if (generatedCourse?.modules?.length > 0) {
        setActiveModuleId(generatedCourse.modules[0].id);
        setActiveArtifact('lectures');
      }

      if (user) {
        await setDoc(doc(db, 'courses', generatedCourse.id), {
          id: generatedCourse.id,
          userId: user.uid,
          title: generatedCourse.title,
          data: generatedCourse,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error(error);
      alert('Failed to generate course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeModule = course?.modules?.find(m => m.id === activeModuleId);

  const handleUpdateModule = (updatedModule: Module) => {
    if (!course) return;
    setCourse({
      ...course,
      modules: course.modules.map(m => m.id === updatedModule.id ? updatedModule : m)
    });
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourse(updatedCourse);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 relative z-10" />
        </div>
        <p className="text-indigo-300/60 font-display font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
          Initializing Pedagogical Core
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
        {/* Immersive AI Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse transition-all duration-[10s]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse transition-all duration-[10s]" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/4 right-1/4 w-[30%] h-[30%] bg-emerald-600/5 rounded-full blur-[100px] animate-pulse transition-all duration-[10s]" style={{ animationDelay: '5s' }} />
          
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          
          {/* Vignette */}
          <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 0%, rgba(10,12,16,0.8) 100%)" />
        </div>

        {/* Floating Header */}
        <header className="absolute top-0 left-0 w-full px-12 py-8 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto group cursor-default">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display font-black text-2xl text-white tracking-tighter">
              EduForge<span className="text-indigo-500">.ai</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-8 pointer-events-auto">
            <nav className="flex items-center gap-6">
              {['Methodology', 'Showcase', 'Enterprise'].map(item => (
                <a key={item} href="#" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-colors">
                  {item}
                </a>
              ))}
            </nav>
            <div className="h-4 w-px bg-slate-800" />
            <button className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all">
              Documentation
            </button>
          </div>
        </header>
        
        <div className="relative z-10 w-full max-w-[1440px] mt-24">
          <SyllabusInput 
            onGenerate={handleGenerate} 
            isLoading={isLoading} 
            userProfile={profile}
            onRegister={handleRegister}
            onLogin={handleLogin}
            onLogout={() => signOut(auth)}
            isAuthenticated={!!user}
          />
        </div>

        {/* Floating Footer Info */}
        <footer className="absolute bottom-8 left-12 right-12 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0C10] bg-slate-800 overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Trusted by <span className="text-white">2,400+</span> Academic Pioneers
            </p>
          </div>
          <div className="flex items-center gap-6 pointer-events-auto">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              System Status: Optimal
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <ModuleSidebar 
        course={course}
        activeModuleId={activeModuleId}
        onSelectModule={(id) => {
          setActiveModuleId(id);
          if (!activeArtifact) setActiveArtifact('lectures');
        }}
        activeArtifact={activeArtifact}
        onSelectArtifact={setActiveArtifact}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCourse(null)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              title="Start Over"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              {activeModule?.title || 'Course Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  U{i}
                </div>
              ))}
            </div>
            <span className="text-xs text-slate-400 font-medium">Collaborating Faculty</span>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <button 
              onClick={() => signOut(auth)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-600"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {course && activeArtifact ? (
            <ArtifactViewer 
              course={course}
              activeModuleId={activeModuleId}
              type={activeArtifact} 
              onUpdateModule={handleUpdateModule}
              onUpdateCourse={handleUpdateCourse}
              learningStyle={generationOptions?.learningStyle || 'textual'}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <Sparkles className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium">Select a module and artifact to begin</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
