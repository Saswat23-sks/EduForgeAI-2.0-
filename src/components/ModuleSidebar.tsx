import React from 'react';
import { ChevronRight, Layout, BookOpen, HelpCircle, ClipboardList, Accessibility, Target, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Course, Module } from '../types/course';

interface ModuleSidebarProps {
  course: Course;
  activeModuleId: string | null;
  onSelectModule: (id: string) => void;
  activeArtifact: string | null;
  onSelectArtifact: (type: string) => void;
}

export default function ModuleSidebar({ 
  course, 
  activeModuleId, 
  onSelectModule,
  activeArtifact,
  onSelectArtifact
}: ModuleSidebarProps) {
  const activeModule = course?.modules?.find(m => m.id === activeModuleId);

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 truncate">{course?.title}</h2>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Course Structure</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Course Blueprint</p>
          <ArtifactButton
            icon={<Target className="w-4 h-4" />}
            label="Pedagogical Map"
            active={activeArtifact === 'blueprint'}
            onClick={() => onSelectArtifact('blueprint')}
          />
        </div>

        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Modules</p>
          {course?.modules?.map((module) => (
            <button
              key={module.id}
              onClick={() => onSelectModule(module.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group",
                activeModuleId === module.id 
                  ? "bg-indigo-50 text-indigo-700 font-semibold" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <span className="truncate">{module.title}</span>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform",
                activeModuleId === module.id ? "rotate-90" : "opacity-0 group-hover:opacity-100"
              )} />
            </button>
          ))}
        </div>

        {activeModule && (
          <div className="space-y-1 animate-in slide-in-from-left-2 duration-300">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Artifacts</p>
            <div className="space-y-1">
              <ArtifactButton
                icon={<Layout className="w-4 h-4" />}
                label="Lecture Outlines"
                active={activeArtifact === 'lectures'}
                onClick={() => onSelectArtifact('lectures')}
              />
              <ArtifactButton
                icon={<BookOpen className="w-4 h-4" />}
                label="Lecture Notes"
                active={activeArtifact === 'lecture-notes'}
                onClick={() => onSelectArtifact('lecture-notes')}
              />
              <ArtifactButton
                icon={<Layout className="w-4 h-4" />}
                label="Presentation Slides"
                active={activeArtifact === 'slides'}
                onClick={() => onSelectArtifact('slides')}
              />
              <ArtifactButton
                icon={<BookOpen className="w-4 h-4" />}
                label="Reading Plans"
                active={activeArtifact === 'readings'}
                onClick={() => onSelectArtifact('readings')}
              />
              <ArtifactButton
                icon={<HelpCircle className="w-4 h-4" />}
                label="Quizzes"
                active={activeArtifact === 'quizzes'}
                onClick={() => onSelectArtifact('quizzes')}
              />
              <ArtifactButton
                icon={<ClipboardList className="w-4 h-4" />}
                label="Assignments"
                active={activeArtifact === 'assignments'}
                onClick={() => onSelectArtifact('assignments')}
              />
              <ArtifactButton
                icon={<ShieldCheck className="w-4 h-4" />}
                label="Pedagogy Audit"
                active={activeArtifact === 'pedagogy'}
                onClick={() => onSelectArtifact('pedagogy')}
              />
              <ArtifactButton
                icon={<Accessibility className="w-4 h-4" />}
                label="Accessibility Check"
                active={activeArtifact === 'accessibility'}
                onClick={() => onSelectArtifact('accessibility')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ArtifactButton({ icon, label, active, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
        active 
          ? "bg-slate-900 text-white shadow-sm" 
          : "text-slate-600 hover:bg-slate-50"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
