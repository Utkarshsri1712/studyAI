import React, { useState } from 'react';
import type { GeneratedQuestions, MCQ } from '../types';

interface QuestionGenerationViewProps {
  result: GeneratedQuestions | null;
}

const MCQItem: React.FC<{ mcq: MCQ, index: number }> = ({ mcq, index }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 transition-shadow hover:shadow-md">
            <p className="font-medium text-slate-700 dark:text-slate-300 mb-3">{index + 1}. {mcq.question}</p>
            <ul className="space-y-2">
                {mcq.options.map((option, i) => (
                    <li key={i} className="text-slate-600 dark:text-slate-400 pl-2">{String.fromCharCode(97 + i)}&#41; {option}</li>
                ))}
            </ul>
            <div className="mt-4">
                <button 
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="text-sm font-semibold text-primary hover:text-primary-hover"
                >
                    {showAnswer ? 'Hide' : 'Show'} Answer
                </button>
                {showAnswer && <p className="mt-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">Answer: {mcq.answer}</p>}
            </div>
        </div>
    );
}

export const QuestionGenerationView: React.FC<QuestionGenerationViewProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
        Generated questions will be displayed here after analysis.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Multiple Choice Questions</h3>
        <div className="space-y-4">
          {result.mcqs.map((mcq, index) => <MCQItem key={index} mcq={mcq} index={index}/>)}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Short Answer Questions</h3>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 transition-shadow hover:shadow-md">
            <ul className="space-y-3 list-decimal list-inside text-slate-700 dark:text-slate-300 marker:text-slate-400 dark:marker:text-slate-500">
              {result.shortAnswers.map((question, index) => (
                <li key={index} className="pl-2">{question}</li>
              ))}
            </ul>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Long Answer Question</h3>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 transition-shadow hover:shadow-md">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{result.longAnswers[0]}</p>
        </div>
      </div>
    </div>
  );
};