export type QuestionType = "open" | "rat" | "likert" | "mcq" | "scenario";

export interface BaseQuestion {
  id: string;
  s: number;
  type: QuestionType;
  text: string;
  illus?: React.ReactNode;
}

export interface OpenQuestion extends BaseQuestion {
  type: "open";
  hint: string;
  ph: string;
}

export interface RATQuestion extends BaseQuestion {
  type: "rat";
  words: string[];
  options: string[];
  answer: string;
}

export interface LikertQuestion extends BaseQuestion {
  type: "likert";
  reversed?: boolean;
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  options: string[];
  scores: number[];
}

export interface ScenarioQuestion extends BaseQuestion {
  type: "scenario";
  scene: string;
  sceneLabel: string;
  options: string[];
  scores: number[];
}

export type Question = OpenQuestion | RATQuestion | LikertQuestion | MCQQuestion | ScenarioQuestion;

export type Answers = Record<string, string | number | undefined>;

export interface AssessmentResults {
  dims: number[];
  cii: number;
}

export interface AIData {
  narrative?: string;
  key_insight?: string;
  strengths?: string;
  blind_spots?: string;
  persona_type?: string;
  improvements?: Array<{ dim: number; action: string }>;
  _divScores?: number[];
  _fallback?: boolean;
  div_q1?: number;
  div_q2?: number;
}
