
export interface AnalysisResult {
  summary: string;
  keywords: string[];
}

export interface MCQ {
  question: string;
  options: string[];
  answer: string;
}

export interface GeneratedQuestions {
  mcqs: MCQ[];
  shortAnswers: string[];
  longAnswers: string[];
}

export interface Topic {
  topic: string;
  probability: number;
}
