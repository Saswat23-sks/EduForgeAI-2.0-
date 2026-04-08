export type LearningStyle = 'visual' | 'textual' | 'active';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
export type AIModel = 'gemini-2.0-flash' | 'gemini-2.0-pro-exp-02-05' | 'gemini-2.0-flash-thinking-exp-01-21';

export interface LearningOutcome {
  id: string;
  description: string;
  bloomLevel: BloomLevel;
}

export interface Reading {
  title: string;
  author: string;
  type: 'textbook' | 'article' | 'video' | 'case-study';
  prerequisites: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  bloomLevel: string;
  difficulty: DifficultyLevel;
  difficultyScore: number; // 0-1
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  rubric: {
    criterion: string;
    weight: number;
    description: string;
  }[];
  learningOutcomes: string[];
}

export interface AdaptiveContent {
  visual: string;
  active: string;
  textual: string;
}

export interface Lecture {
  id: string;
  title: string;
  outline: string[];
  keyConcepts: string[];
  discussionQuestions: string[];
  lectureNotes: string; // Detailed notes for the teacher
  presentationSlides: {
    title: string;
    content: string[];
    speakerNotes: string;
  }[];
  visualAids?: string[];
  activitySuggestions?: string[];
  adaptiveContent?: AdaptiveContent;
}

export interface PedagogyReport {
  coverage: {
    lo_id: string;
    covered: boolean;
    strength: 'strong' | 'medium' | 'weak';
    missing_elements: string[];
  }[];
  suggestions: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lectures: Lecture[];
  readings: Reading[];
  quizzes: QuizQuestion[];
  assignments: Assignment[];
  pedagogyReport?: PedagogyReport;
}

export interface TopicMapping {
  topic: string;
  alignedLOs: string[];
}

export interface CurriculumSequencing {
  orderedTopics: string[];
  dependencies: {
    topic: string;
    requires: string[];
  }[];
  warnings: string[];
}

export interface Resource {
  title: string;
  type: 'textbook' | 'article' | 'video';
  level: 'beginner' | 'intermediate' | 'advanced';
  url?: string;
}

export interface ReadingPlanItem {
  topic: string;
  resources: Resource[];
}

export interface ReadingPlan {
  items: ReadingPlanItem[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  learningOutcomes: LearningOutcome[];
  topicMapping: TopicMapping[];
  modules: Module[];
  targetAudience: string;
  classSize: number;
  sequencing?: CurriculumSequencing;
  readingPlan?: ReadingPlan;
}
