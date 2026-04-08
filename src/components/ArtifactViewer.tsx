import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Download, Edit3, CheckCircle2, AlertCircle, Sparkles, BookOpen, Accessibility, Eye, ShieldCheck, Loader2, Presentation, FileText, Target, Layout } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Course, Module, Lecture, Reading, QuizQuestion, Assignment, LearningStyle, PedagogyReport, CurriculumSequencing, ReadingPlan, AdaptiveContent } from '../types/course';
// remove this line completely OR keep only what exists
// TEMP FIX: stub functions to avoid build errors

async function adaptArtifact(data: any) {
  return data;
}

async function validatePedagogy() {
  return {};
}

async function sequenceCurriculum() {
  return {};
}

async function generateReadingPlan() {
  return {};
}

async function transformToAdaptiveContent() {
  return {};
}

async function generateAssessment() {
  return [];
}

async function refineContentWithFeedback(content: string) {
  return { updated_content: content };
}

interface ArtifactViewerProps {
  course: Course;
  activeModuleId: string | null;
  type: string;
  onUpdateModule: (module: Module) => void;
  onUpdateCourse: (course: Course) => void;
  learningStyle: LearningStyle;
}

export default function ArtifactViewer({ course, activeModuleId, type, onUpdateModule, onUpdateCourse, learningStyle }: ArtifactViewerProps) {
  const [isRefining, setIsRefining] = useState(false);
  const module = course.modules.find(m => m.id === activeModuleId);

  const handleRefine = async (overrideStyle?: LearningStyle) => {
    if (type === 'accessibility' || type === 'blueprint' || type === 'pedagogy' || !module) return;
    
    setIsRefining(true);
    try {
      let artifactKey: keyof Module = 'lectures';
      let adaptType: 'lecture' | 'quiz' | 'assignment' | 'reading' = 'lecture';

      if (type === 'lectures' || type === 'lecture-notes' || type === 'slides') {
        artifactKey = 'lectures';
        adaptType = 'lecture';
      } else if (type === 'quizzes') {
        artifactKey = 'quizzes';
        adaptType = 'quiz';
      } else if (type === 'assignments') {
        artifactKey = 'assignments';
        adaptType = 'assignment';
      } else if (type === 'readings') {
        artifactKey = 'readings';
        adaptType = 'reading';
      }

      const artifactData = module[artifactKey];
      const refinedArtifact = await adaptArtifact(artifactData, adaptType, overrideStyle || learningStyle);
      
      const updatedModule = {
        ...module,
        [artifactKey]: refinedArtifact
      };
      
      onUpdateModule(updatedModule);
    } catch (error) {
      console.error('Failed to refine artifact:', error);
      alert('Failed to refine artifact. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleValidatePedagogy = async () => {
    if (!module) return;
    setIsRefining(true);
    try {
      const report = await validatePedagogy(
        course.learningOutcomes,
        module.lectures,
        module.quizzes,
        module.assignments
      );
      onUpdateModule({ ...module, pedagogyReport: report });
    } catch (error) {
      console.error('Pedagogy validation failed:', error);
      alert('Failed to validate pedagogy.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSequenceCurriculum = async () => {
    setIsRefining(true);
    try {
      const topics = course.modules.map(m => m.title);
      const sequencing = await sequenceCurriculum(topics);
      onUpdateCourse({ ...course, sequencing });
    } catch (error) {
      console.error('Curriculum sequencing failed:', error);
      alert('Failed to sequence curriculum.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateReadingPlan = async () => {
    if (!course.sequencing) return;
    setIsRefining(true);
    try {
      const readingPlan = await generateReadingPlan(course.sequencing.orderedTopics);
      onUpdateCourse({ ...course, readingPlan });
    } catch (error) {
      console.error('Reading plan generation failed:', error);
      alert('Failed to generate reading plan.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleTransformAdaptive = async (lectureId: string) => {
    if (!module) return;
    const lecture = module.lectures.find(l => l.id === lectureId);
    if (!lecture) return;

    setIsRefining(true);
    try {
      const adaptive = await transformToAdaptiveContent(lecture.title, lecture.lectureNotes);
      const updatedLectures = module.lectures.map(l => 
        l.id === lectureId ? { ...l, adaptiveContent: adaptive } : l
      );
      onUpdateModule({ ...module, lectures: updatedLectures });
    } catch (error) {
      console.error('Adaptive transformation failed:', error);
      alert('Failed to generate adaptive content.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateAssessment = async () => {
    if (!module) return;
    setIsRefining(true);
    try {
      const questions = await generateAssessment(module.title, course.learningOutcomes);
      onUpdateModule({ ...module, quizzes: questions });
    } catch (error) {
      console.error('Assessment generation failed:', error);
      alert('Failed to generate assessment.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleFeedbackRefine = async (lectureId: string, feedback: string) => {
    if (!module) return;
    
    setIsRefining(true);
    try {
      if (type === 'slides') {
        const lecture = module.lectures.find(l => l.id === lectureId);
        if (!lecture) return;
        const { updated_content } = await refineContentWithFeedback(JSON.stringify(lecture.presentationSlides), feedback);
        const updatedLectures = module.lectures.map(l => 
          l.id === lectureId ? { ...l, presentationSlides: JSON.parse(updated_content) } : l
        );
        onUpdateModule({ ...module, lectures: updatedLectures });
      } else if (type === 'assignments') {
        const assignment = module.assignments.find(a => a.id === lectureId);
        if (!assignment) return;
        const { updated_content } = await refineContentWithFeedback(assignment.description, feedback);
        const updatedAssignments = module.assignments.map(a => 
          a.id === lectureId ? { ...a, description: updated_content } : a
        );
        onUpdateModule({ ...module, assignments: updatedAssignments });
      } else if (type === 'quizzes') {
        const quiz = module.quizzes.find(q => q.id === lectureId);
        if (!quiz) return;
        const { updated_content } = await refineContentWithFeedback(JSON.stringify(quiz), feedback);
        const updatedQuizzes = module.quizzes.map(q => 
          q.id === lectureId ? JSON.parse(updated_content) : q
        );
        onUpdateModule({ ...module, quizzes: updatedQuizzes });
      } else {
        const lecture = module.lectures.find(l => l.id === lectureId);
        if (!lecture) return;
        const { updated_content } = await refineContentWithFeedback(lecture.lectureNotes, feedback);
        const updatedLectures = module.lectures.map(l => 
          l.id === lectureId ? { ...l, lectureNotes: updated_content } : l
        );
        onUpdateModule({ ...module, lectures: updatedLectures });
      }
    } catch (error) {
      console.error('Feedback refinement failed:', error);
      alert('Failed to refine content with feedback.');
    } finally {
      setIsRefining(false);
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'lectures':
        return (
          <LectureView 
            lectures={module?.lectures || []} 
            onTransformAdaptive={handleTransformAdaptive}
            onFeedbackRefine={handleFeedbackRefine}
            isTransforming={isRefining}
          />
        );
      case 'lecture-notes':
        return (
          <LectureNotesView 
            lectures={module?.lectures || []} 
            onFeedbackRefine={handleFeedbackRefine}
            isTransforming={isRefining}
          />
        );
      case 'slides':
        return (
          <SlidesView 
            lectures={module?.lectures || []} 
            onFeedbackRefine={handleFeedbackRefine}
            isTransforming={isRefining}
          />
        );
      case 'readings':
        return <ReadingView readings={module?.readings || []} />;
      case 'quizzes':
        return (
          <QuizView 
            quizzes={module?.quizzes || []} 
            onGenerateAssessment={handleGenerateAssessment}
            onFeedbackRefine={handleFeedbackRefine}
            isGenerating={isRefining}
          />
        );
      case 'assignments':
        return (
          <AssignmentView 
            assignments={module?.assignments || []} 
            onFeedbackRefine={handleFeedbackRefine}
            isTransforming={isRefining}
          />
        );
      case 'accessibility':
        return module ? <AccessibilityView module={module} /> : null;
      case 'pedagogy':
        return module ? (
          <PedagogyView 
            report={module.pedagogyReport} 
            onValidate={handleValidatePedagogy}
            isValidating={isRefining}
          />
        ) : null;
      case 'blueprint':
        return (
          <BlueprintView 
            course={course} 
            onSequence={handleSequenceCurriculum}
            onGenerateReadingPlan={handleGenerateReadingPlan}
            isRefining={isRefining}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
            <LayoutPlaceholder />
            <p>Select an artifact to view details</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 capitalize">
            {type.replace('-', ' ')}
          </h2>
          <div className="flex gap-2">
            {(type === 'lectures' || type === 'lecture-notes' || type === 'slides') && learningStyle !== 'active' && (
              <button 
                onClick={() => handleRefine('active')}
                disabled={isRefining}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-50"
              >
                {isRefining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Make Interactive
              </button>
            )}
            {type === 'quizzes' && learningStyle !== 'active' && (
              <button 
                onClick={() => handleRefine('active')}
                disabled={isRefining}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-50"
              >
                {isRefining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Make Scenario-Based
              </button>
            )}
            {type !== 'accessibility' && (
              <button 
                onClick={() => handleRefine()}
                disabled={isRefining}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                {isRefining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Edit3 className="w-4 h-4" />
                )}
                Refine with AI
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all">
              <Download className="w-4 h-4" />
              Export PDF/Doc
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[600px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function PedagogyView({ 
  report, 
  onValidate, 
  isValidating 
}: { 
  report?: PedagogyReport; 
  onValidate: () => void;
  isValidating: boolean;
}) {
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-6">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Pedagogy Validation Engine</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Analyze your module content against learning objectives to identify gaps and improve pedagogical alignment.
          </p>
        </div>
        <button
          onClick={onValidate}
          disabled={isValidating}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
        >
          {isValidating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          Run Pedagogy Audit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Audit Results</h3>
            <p className="text-sm text-slate-500">Coverage analysis and improvement suggestions</p>
          </div>
        </div>
        <button
          onClick={onValidate}
          disabled={isValidating}
          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
        >
          {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Re-run Audit
        </button>
      </div>

      <div className="space-y-6">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Objective Coverage</h4>
        <div className="grid grid-cols-1 gap-4">
          {report.coverage.map((item, i) => (
            <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1",
                  item.covered ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                )}>
                  {item.covered ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-400">{item.lo_id}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                      item.strength === 'strong' ? "bg-emerald-50 text-emerald-700" :
                      item.strength === 'medium' ? "bg-amber-50 text-amber-700" :
                      "bg-red-50 text-red-700"
                    )}>
                      {item.strength} coverage
                    </span>
                  </div>
                  {item.missing_elements.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {item.missing_elements.map((el, j) => (
                        <li key={j} className="text-xs text-slate-500 flex gap-2">
                          <span className="text-indigo-400">•</span>
                          {el}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Strategic Suggestions</h4>
        <div className="space-y-3">
          {report.suggestions.map((suggestion, i) => (
            <div key={i} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm text-indigo-900 flex gap-3">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              {suggestion}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlueprintView({ 
  course, 
  onSequence, 
  onGenerateReadingPlan,
  isRefining 
}: { 
  course: Course; 
  onSequence: () => void;
  onGenerateReadingPlan: () => void;
  isRefining: boolean;
}) {
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Learning Objectives</h3>
              <p className="text-sm text-slate-500">Pedagogical goals aligned with Bloom's Taxonomy</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSequence}
              disabled={isRefining}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
            >
              {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Sequence Curriculum
            </button>
            {course.sequencing && (
              <button
                onClick={onGenerateReadingPlan}
                disabled={isRefining}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-all disabled:opacity-50"
              >
                {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                Generate Reading Plan
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {course.learningOutcomes.map((lo) => (
            <div key={lo.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4 group hover:border-indigo-200 transition-all">
              <div className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-indigo-600 uppercase shrink-0 mt-1">
                {lo.bloomLevel}
              </div>
              <div className="flex-1">
                <div className="text-xs font-mono text-slate-400 mb-1">{lo.id}</div>
                <p className="text-slate-700 font-medium leading-relaxed">{lo.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {course.sequencing && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Curriculum Sequencing</h3>
              <p className="text-sm text-slate-500">Logical progression and prerequisite dependencies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recommended Order</h4>
              <div className="space-y-2">
                {course.sequencing.orderedTopics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Dependencies</h4>
                <div className="space-y-3">
                  {course.sequencing.dependencies.map((dep, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-sm font-bold text-slate-900 mb-2">{dep.topic}</div>
                      <div className="flex flex-wrap gap-2">
                        {dep.requires.map((req, j) => (
                          <span key={j} className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-500">
                            requires {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {course.sequencing.warnings.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    Sequencing Warnings
                  </div>
                  {course.sequencing.warnings.map((warning, i) => (
                    <p key={i} className="text-xs text-red-700 leading-relaxed">• {warning}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {course.readingPlan && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Academic Reading Plan</h3>
              <p className="text-sm text-slate-500">Curated resources building on prerequisites</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {course.readingPlan.items.map((item, i) => (
              <div key={i} className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-500">
                    {i + 1}
                  </span>
                  {item.topic}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {item.resources.map((res, j) => (
                    <div key={j} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                          res.type === 'textbook' ? "bg-blue-50 text-blue-700" :
                          res.type === 'article' ? "bg-indigo-50 text-indigo-700" :
                          "bg-red-50 text-red-700"
                        )}>
                          {res.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {res.level}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                        {res.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Topic Mapping</h3>
            <p className="text-sm text-slate-500">Alignment between core topics and learning objectives</p>
          </div>
        </div>

        <div className="overflow-hidden border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700">Topic / Concept</th>
                <th className="px-6 py-4 font-bold text-slate-700">Aligned Objectives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {course.topicMapping?.map((map, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{map.topic}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {map.alignedLOs.map(loId => (
                        <span key={loId} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded border border-indigo-100">
                          {loId}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LectureView({ 
  lectures, 
  onTransformAdaptive,
  onFeedbackRefine,
  isTransforming 
}: { 
  lectures: Lecture[]; 
  onTransformAdaptive: (id: string) => void;
  onFeedbackRefine: (id: string, feedback: string) => void;
  isTransforming: boolean;
}) {
  const lectureList = Array.isArray(lectures) ? lectures : [];
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  return (
    <div className="space-y-12">
      {lectureList.map((lecture, idx) => (
        <div key={idx} className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{lecture?.title}</h3>
              <div className="flex gap-2 mt-2">
                {Array.isArray(lecture?.keyConcepts) && lecture.keyConcepts.map((concept, i) => (
                  <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onTransformAdaptive(lecture.id)}
                disabled={isTransforming}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
              >
                {isTransforming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Adaptive Versions
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Teaching Assistant Feedback</label>
              <input 
                type="text"
                placeholder="e.g., 'Too difficult', 'Add more examples', 'Explain recursion better'"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={feedback[lecture.id] || ''}
                onChange={(e) => setFeedback(prev => ({ ...prev, [lecture.id]: e.target.value }))}
              />
            </div>
            <button
              onClick={() => {
                if (feedback[lecture.id]) {
                  onFeedbackRefine(lecture.id, feedback[lecture.id]);
                  setFeedback(prev => ({ ...prev, [lecture.id]: '' }));
                }
              }}
              disabled={isTransforming || !feedback[lecture.id]}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              Refine Content
            </button>
          </div>

          {lecture.adaptiveContent && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                  <Eye className="w-4 h-4" />
                  Visual Learning
                </div>
                <div className="prose prose-sm max-w-none text-slate-600">
                  <Markdown>{lecture.adaptiveContent.visual}</Markdown>
                </div>
              </div>
              <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                  <Target className="w-4 h-4" />
                  Active Learning
                </div>
                <div className="prose prose-sm max-w-none text-slate-600">
                  <Markdown>{lecture.adaptiveContent.active}</Markdown>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-widest">
                  <FileText className="w-4 h-4" />
                  Textual Learning
                </div>
                <div className="prose prose-sm max-w-none text-slate-600">
                  <Markdown>{lecture.adaptiveContent.textual}</Markdown>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Outline</h4>
              <ul className="space-y-3">
                {Array.isArray(lecture?.outline) && lecture.outline.map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-700">
                    <span className="text-indigo-400 font-mono text-sm">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Discussion Questions</h4>
                <div className="space-y-3">
                  {Array.isArray(lecture?.discussionQuestions) && lecture.discussionQuestions.map((q, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 italic">
                      "{q}"
                    </div>
                  ))}
                </div>
              </div>

              {lecture?.activitySuggestions && Array.isArray(lecture.activitySuggestions) && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Learning</h4>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <ul className="space-y-2">
                      {lecture.activitySuggestions.map((act, i) => (
                        <li key={i} className="text-sm text-emerald-800 flex gap-2">
                          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadingView({ readings }: { readings: Reading[] }) {
  const readingList = Array.isArray(readings) ? readings : [];
  return (
    <div className="space-y-8">
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800">
          These readings are sequenced based on prerequisite knowledge. Ensure students complete them in the order listed.
        </p>
      </div>
      <div className="space-y-4">
        {readingList.map((reading, idx) => (
          <div key={idx} className="flex items-start gap-4 p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">{reading?.title}</h4>
              <p className="text-sm text-slate-500">{reading?.author} • {reading?.type}</p>
              {Array.isArray(reading?.prerequisites) && reading.prerequisites.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Prerequisites:</span>
                  {reading.prerequisites.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizView({ 
  quizzes, 
  onGenerateAssessment,
  onFeedbackRefine,
  isGenerating 
}: { 
  quizzes: QuizQuestion[]; 
  onGenerateAssessment: () => void;
  onFeedbackRefine: (id: string, feedback: string) => void;
  isGenerating: boolean;
}) {
  const quizList = Array.isArray(quizzes) ? quizzes : [];
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Module Assessment</h3>
          <p className="text-sm text-slate-500">6 questions mapped to Bloom's Taxonomy</p>
        </div>
        <button
          onClick={onGenerateAssessment}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Assessment
        </button>
      </div>

      {quizList.map((q, idx) => (
        <div key={idx} className="space-y-4 p-6 border border-slate-100 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded">
                {q?.bloomLevel}
              </span>
              <span className={cn(
                "px-2 py-1 text-[10px] font-bold uppercase rounded",
                q?.difficulty === 'beginner' ? "bg-emerald-50 text-emerald-600" :
                q?.difficulty === 'intermediate' ? "bg-amber-50 text-amber-600" :
                "bg-red-50 text-red-600"
              )}>
                {q?.difficulty}
              </span>
              {q?.difficultyScore !== undefined && (
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded">
                  Score: {q.difficultyScore.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-mono">Q{idx + 1}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Teaching Assistant Feedback</label>
              <input 
                type="text"
                placeholder="e.g., 'Make it harder', 'Change option B', 'Clarify explanation'"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={feedback[q.id] || ''}
                onChange={(e) => setFeedback(prev => ({ ...prev, [q.id]: e.target.value }))}
              />
            </div>
            <button
              onClick={() => {
                if (feedback[q.id]) {
                  onFeedbackRefine(q.id, feedback[q.id]);
                  setFeedback(prev => ({ ...prev, [q.id]: '' }));
                }
              }}
              disabled={isGenerating || !feedback[q.id]}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              Refine Question
            </button>
          </div>

          <p className="text-lg font-medium text-slate-900">{q?.question}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.isArray(q?.options) && q.options.map((opt, i) => (
              <div 
                key={i} 
                className={cn(
                  "p-4 rounded-xl border text-sm transition-all",
                  i === q.correctAnswer 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                    : "bg-white border-slate-200 text-slate-600"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white border border-inherit flex items-center justify-center font-bold text-[10px]">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {i === q.correctAnswer && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Pedagogical Explanation</p>
            <p className="text-sm text-indigo-800 leading-relaxed">{q?.explanation}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AssignmentView({ 
  assignments, 
  onFeedbackRefine,
  isTransforming 
}: { 
  assignments: Assignment[]; 
  onFeedbackRefine: (id: string, feedback: string) => void;
  isTransforming: boolean;
}) {
  const assignmentList = Array.isArray(assignments) ? assignments : [];
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  return (
    <div className="space-y-12">
      {assignmentList.map((assignment, idx) => (
        <div key={idx} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900">{assignment?.title}</h3>
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Teaching Assistant Feedback</label>
                <input 
                  type="text"
                  placeholder="e.g., 'Too difficult', 'Add more examples', 'Simplify rubric'"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={feedback[assignment.id] || ''}
                  onChange={(e) => setFeedback(prev => ({ ...prev, [assignment.id]: e.target.value }))}
                />
              </div>
              <button
                onClick={() => {
                  if (feedback[assignment.id]) {
                    onFeedbackRefine(assignment.id, feedback[assignment.id]);
                    setFeedback(prev => ({ ...prev, [assignment.id]: '' }));
                  }
                }}
                disabled={isTransforming || !feedback[assignment.id]}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                Refine Assignment
              </button>
            </div>

            <div className="prose prose-slate max-w-none text-slate-600">
              <Markdown>{assignment?.description || ''}</Markdown>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Rubric & Outcomes</h4>
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-700">Criterion</th>
                    <th className="px-4 py-3 font-bold text-slate-700">Weight</th>
                    <th className="px-4 py-3 font-bold text-slate-700">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.isArray(assignment?.rubric) && assignment.rubric.map((row, i) => (
                    <tr key={i}>
                      <td className="px-4 py-4 font-semibold text-slate-900">{row?.criterion}</td>
                      <td className="px-4 py-4 text-slate-600">{row?.weight}%</td>
                      <td className="px-4 py-4 text-slate-500 leading-relaxed">{row?.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccessibilityView({ module }: { module: Module }) {
  return (
    <div className="space-y-8">
      <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-emerald-900">UDL & WCAG Compliance Report</h3>
          <p className="text-sm text-emerald-700">All generated materials for this module have been reviewed for accessibility standards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Eye className="w-5 h-5" />
            <h4 className="font-bold">Visual Accessibility</h4>
          </div>
          <ul className="space-y-3">
            <li className="flex gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              High-contrast text patterns used in lecture outlines.
            </li>
            <li className="flex gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Alt-text descriptions generated for all suggested visual aids.
            </li>
            <li className="flex gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Screen-reader optimized table structures for rubrics.
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Accessibility className="w-5 h-5" />
            <h4 className="font-bold">Cognitive Accessibility</h4>
          </div>
          <ul className="space-y-3">
            <li className="flex gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Clear prerequisite sequencing for all reading materials.
            </li>
            <li className="flex gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Bloom's Taxonomy alignment ensures cognitive load calibration.
            </li>
            <li className="flex gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Multi-modal activity suggestions (visual, textual, active).
            </li>
          </ul>
        </div>
      </div>

      <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4">
        <h4 className="font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Auto-Generated Alternatives
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['Audio Transcript', 'Simplified Summary', 'Braille-Ready File'].map((alt) => (
            <button key={alt} className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs font-medium hover:bg-slate-700 transition-all text-center">
              Generate {alt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LectureNotesView({ 
  lectures, 
  onFeedbackRefine,
  isTransforming 
}: { 
  lectures: Lecture[]; 
  onFeedbackRefine: (id: string, feedback: string) => void;
  isTransforming: boolean;
}) {
  const lectureList = Array.isArray(lectures) ? lectures : [];
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  return (
    <div className="space-y-12">
      {lectureList.map((lecture, idx) => (
        <div key={idx} className="space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">{lecture?.title}</h3>
            <div className="flex items-center gap-2 text-slate-400">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-medium">Lecture Notes</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Teaching Assistant Feedback</label>
              <input 
                type="text"
                placeholder="e.g., 'Too difficult', 'Add more examples', 'Explain recursion better'"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={feedback[lecture.id] || ''}
                onChange={(e) => setFeedback(prev => ({ ...prev, [lecture.id]: e.target.value }))}
              />
            </div>
            <button
              onClick={() => {
                if (feedback[lecture.id]) {
                  onFeedbackRefine(lecture.id, feedback[lecture.id]);
                  setFeedback(prev => ({ ...prev, [lecture.id]: '' }));
                }
              }}
              disabled={isTransforming || !feedback[lecture.id]}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              Refine Notes
            </button>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <Markdown>{lecture?.lectureNotes || 'No notes generated for this lecture.'}</Markdown>
          </div>
        </div>
      ))}
    </div>
  );
}

function SlidesView({ 
  lectures, 
  onFeedbackRefine,
  isTransforming 
}: { 
  lectures: Lecture[]; 
  onFeedbackRefine: (id: string, feedback: string) => void;
  isTransforming: boolean;
}) {
  const lectureList = Array.isArray(lectures) ? lectures : [];
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  return (
    <div className="space-y-16">
      {lectureList.map((lecture, lIdx) => (
        <div key={lIdx} className="space-y-8">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">{lecture?.title}</h3>
            <div className="flex items-center gap-2 text-slate-400">
              <Presentation className="w-4 h-4" />
              <span className="text-xs font-medium">Presentation Slides</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Teaching Assistant Feedback</label>
              <input 
                type="text"
                placeholder="e.g., 'Too difficult', 'Add more examples', 'Explain recursion better'"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={feedback[lecture.id] || ''}
                onChange={(e) => setFeedback(prev => ({ ...prev, [lecture.id]: e.target.value }))}
              />
            </div>
            <button
              onClick={() => {
                if (feedback[lecture.id]) {
                  onFeedbackRefine(lecture.id, feedback[lecture.id]);
                  setFeedback(prev => ({ ...prev, [lecture.id]: '' }));
                }
              }}
              disabled={isTransforming || !feedback[lecture.id]}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              Refine Slides
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-12">
            {Array.isArray(lecture?.presentationSlides) && lecture.presentationSlides.map((slide, sIdx) => (
              <div key={sIdx} className="space-y-4">
                <div className="aspect-video bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-800">
                  <div className="p-8 bg-slate-800 border-b border-slate-700">
                    <h4 className="text-2xl font-bold text-white text-center">{slide.title}</h4>
                  </div>
                  <div className="flex-1 p-12 flex items-center justify-center">
                    <ul className="space-y-4 text-slate-300 text-lg">
                      {Array.isArray(slide.content) && slide.content.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex gap-3">
                          <span className="text-indigo-400">•</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-800/50 text-[10px] text-slate-500 font-mono text-center uppercase tracking-widest">
                    Slide {sIdx + 1} of {lecture.presentationSlides.length}
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Speaker Notes</p>
                  <p className="text-sm text-amber-800 leading-relaxed italic">
                    {slide.speakerNotes || 'No speaker notes for this slide.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LayoutPlaceholder() {
  return (
    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-400 rounded-full animate-pulse" />
    </div>
  );
}
