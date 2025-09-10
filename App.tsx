import React, { useState, useCallback, useEffect } from 'react';
import type { AnalysisResult, GeneratedQuestions, Topic } from './types';
import { analyzeDocument, generateQuestions, predictTopics } from './services/geminiService';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Spinner } from './components/ui/Spinner';
import { DocumentAnalysisView } from './components/DocumentAnalysisView';
import { QuestionGenerationView } from './components/QuestionGenerationView';
import { TopicPredictionView } from './components/TopicPredictionView';
import { BookOpenIcon, ChartBarIcon, SparklesIcon, UploadIcon, FileTextIcon, XCircleIcon, WarningIcon, GraduationCapIcon, SunIcon, MoonIcon } from './components/icons';

type ActiveTab = 'analysis' | 'questions' | 'topics';
type Theme = 'light' | 'dark';

const LOADING_MESSAGES = [
    'Brewing coffee for the AI...',
    'Analyzing textual nuances...',
    'Generating insightful questions...',
    'Predicting key topics...',
    'Consulting the digital oracles...',
    'Almost there...',
];

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('analysis');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestions | null>(null);
  const [topicPredictions, setTopicPredictions] = useState<Topic[] | null>(null);

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('theme') as Theme) || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessage(prev => {
            const nextIndex = (LOADING_MESSAGES.indexOf(prev) + 1) % LOADING_MESSAGES.length;
            return LOADING_MESSAGES[nextIndex];
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      setError('Unsupported file type. Please upload a .txt file.');
      setFileName(null);
      setInputText('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      setFileName(file.name);
      setError(null);
    };
    reader.onerror = () => {
        setError('Failed to read the file.');
        setFileName(null);
        setInputText('');
    }
    reader.readAsText(file);
    
    e.target.value = '';
  };

  const clearFile = () => {
    setFileName(null);
    setInputText('');
    setError(null);
  };

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please enter some text or upload a file to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setGeneratedQuestions(null);
    setTopicPredictions(null);
    setLoadingMessage(LOADING_MESSAGES[0]);

    try {
      const results = await Promise.allSettled([
        analyzeDocument(inputText),
        generateQuestions(inputText),
        predictTopics(inputText),
      ]);

      const analysisRes = results[0];
      if (analysisRes.status === 'fulfilled') setAnalysisResult(analysisRes.value);
      else console.error('Analysis failed:', analysisRes.reason);
      
      const questionsRes = results[1];
      if (questionsRes.status === 'fulfilled') setGeneratedQuestions(questionsRes.value);
      else console.error('Question generation failed:', questionsRes.reason);

      const topicsRes = results[2];
      if (topicsRes.status === 'fulfilled') setTopicPredictions(topicsRes.value);
      else console.error('Topic prediction failed:', topicsRes.reason);

      if (results.some(res => res.status === 'rejected')) {
        setError('One or more AI tasks failed. Some results may be missing.');
      }

    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred. Please check the console and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-full min-h-[30rem]">
          <Spinner />
          <p className="mt-4 text-slate-500 dark:text-slate-400 transition-opacity duration-300">{loadingMessage}</p>
        </div>
      );
    }

    if (!analysisResult && !generatedQuestions && !topicPredictions && !error) {
       return (
        <div className="flex flex-col items-center justify-center p-8 h-full min-h-[30rem] text-center">
            <SparklesIcon className="w-16 h-16 text-indigo-500/20 dark:text-sky-500/30 animate-pulse" />
            <p className="mt-4 text-slate-500 dark:text-slate-400">Your AI-generated insights will appear here.</p>
        </div>
       );
    }
    
    if (error && !analysisResult && !generatedQuestions && !topicPredictions) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full min-h-[30rem] text-center text-red-500 dark:text-red-400">
                <WarningIcon className="w-12 h-12 mb-4"/>
                <p className="font-semibold">An Error Occurred</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
            </div>
        );
    }

    switch (activeTab) {
      case 'analysis':
        return <DocumentAnalysisView result={analysisResult} />;
      case 'questions':
        return <QuestionGenerationView result={generatedQuestions} />;
      case 'topics':
        return <TopicPredictionView result={topicPredictions} theme={theme} />;
      default:
        return null;
    }
  };
  
  const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'analysis', label: 'Summary & Keywords', icon: <BookOpenIcon className="w-5 h-5 mr-2"/> },
    { id: 'questions', label: 'Question Generator', icon: <SparklesIcon className="w-5 h-5 mr-2"/> },
    { id: 'topics', label: 'Topic Prediction', icon: <ChartBarIcon className="w-5 h-5 mr-2"/> },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <main className="max-w-screen-2xl mx-auto">
        <header className="flex items-center justify-between text-left mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center">
            <GraduationCapIcon className="w-10 h-10 text-primary mr-4" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                StudyAI
              </h1>
              <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
                Your AI-powered study partner.
              </p>
            </div>
          </div>
           <button
            onClick={toggleTheme}
            className="ml-6 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-primary"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
          </button>
        </header>

        <div className="grid lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6 h-fit sticky top-8">
              {!fileName ? (
                  <div className="mb-4">
                    <label
                      htmlFor="file-upload"
                      className="relative block w-full rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 text-center hover:border-primary dark:hover:border-accent hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <UploadIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                      <span className="mt-2 block text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Upload a .txt file
                      </span>
                       <span className="mt-1 block text-xs text-slate-500">
                        PDF & DOCX support coming soon
                      </span>
                      <input
                        id="file-upload" name="file-upload" type="file" className="sr-only"
                        accept=".txt" onChange={handleFileChange}
                      />
                    </label>
                    <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                        <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-sm">OR</span>
                        <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900/50 rounded-md border border-slate-300 dark:border-slate-600">
                      <div className="flex items-center gap-2 overflow-hidden">
                          <FileTextIcon className="w-5 h-5 text-primary dark:text-accent flex-shrink-0"/>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{fileName}</span>
                      </div>
                      <button onClick={clearFile} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex-shrink-0 ml-2">
                          <XCircleIcon className="w-6 h-6" />
                      </button>
                  </div>
                )}
              <textarea
                value={inputText}
                onChange={(e) => {
                    setInputText(e.target.value)
                    if (fileName) setFileName(null);
                }}
                placeholder="Paste your text here..."
                className="w-full h-48 p-4 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-y"
              />
              {error && !isLoading && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
              <div className="mt-4 flex justify-end">
                <Button onClick={handleAnalyze} disabled={isLoading || !inputText.trim()}>
                  {isLoading ? <Spinner /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                  {isLoading ? 'Analyzing...' : 'Generate Insights'}
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3 mt-8 lg:mt-0">
              <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 rounded-t-md
                        ${activeTab === tab.id
                          ? 'border-primary text-primary bg-slate-100 dark:bg-slate-800/50'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-400 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'
                        }
                      `}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              <Card className="mt-0 rounded-t-none border-t-0">
                  {renderContent()}
              </Card>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default App;