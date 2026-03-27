/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { generateFitnessPlan } from './services/gemini';
import { FitnessPlan, UserPreferences, Language, Theme } from './types';
import { Activity, Moon, Sun, Languages } from 'lucide-react';
import { motion } from 'motion/react';
import { i18n } from './i18n';

export default function App() {
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('ar');
  const [isMonthlyUpdate, setIsMonthlyUpdate] = useState(false);

  const [loadingTextIdx, setLoadingTextIdx] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [theme, language]);

  useEffect(() => {
    if (isLoading) {
      const texts = language === 'ar' 
        ? ['جاري تحليل بياناتك...', 'تصميم خطة التمرين...', 'تجهيز النظام الغذائي...', 'اللمسات الأخيرة...']
        : ['Analyzing your data...', 'Designing workout plan...', 'Preparing diet plan...', 'Final touches...'];
      
      const interval = setInterval(() => {
        setLoadingTextIdx(prev => (prev + 1) % texts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading, language]);

  const t = i18n[language];

  const handleCompleteOnboarding = async (newPrefs: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    setPrefs(newPrefs);
    try {
      const generatedPlan = await generateFitnessPlan(newPrefs);
      setPlan(generatedPlan);
      setIsMonthlyUpdate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setPrefs(null);
    setError(null);
    setIsMonthlyUpdate(false);
  };

  const handleMonthlyUpdate = () => {
    setPlan(null);
    setIsMonthlyUpdate(true);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'ar' : 'en');

  const Controls = () => (
    <div className="fixed bottom-6 right-6 z-[60] flex gap-2 rtl:left-6 rtl:right-auto">
      <button onClick={toggleLanguage} className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-lg shadow-black/5 dark:shadow-black/20 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all hover:-translate-y-1 flex items-center gap-2 px-5 border border-zinc-200 dark:border-zinc-700">
        <Languages className="w-5 h-5" />
        <span className="text-sm font-bold">{t.langToggle}</span>
      </button>
      <button onClick={toggleTheme} className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-lg shadow-black/5 dark:shadow-black/20 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all hover:-translate-y-1 border border-zinc-200 dark:border-zinc-700">
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </div>
  );

  if (isLoading) {
    const loadingTexts = language === 'ar' 
      ? ['جاري تحليل بياناتك...', 'تصميم خطة التمرين...', 'تجهيز النظام الغذائي...', 'اللمسات الأخيرة...']
      : ['Analyzing your data...', 'Designing workout plan...', 'Preparing diet plan...', 'Final touches...'];

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
        <Controls />
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full mb-8"
        />
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 mb-2">
          {loadingTexts[loadingTextIdx]}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-md">
          {t.analyzingDesc}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
        <Controls />
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 max-w-md text-center">
          <Activity className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-emerald-500 dark:text-emerald-400 mb-2">{t.error}</h2>
          <p className="text-zinc-700 dark:text-zinc-300 mb-6">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="px-6 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm rounded-xl font-medium transition-colors"
          >
            {t.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <Controls />
      {plan && prefs ? (
        <Dashboard 
          plan={plan} 
          prefs={prefs} 
          onReset={handleReset} 
          onMonthlyUpdate={handleMonthlyUpdate}
          language={language}
        />
      ) : (
        <Onboarding 
          onComplete={handleCompleteOnboarding} 
          language={language} 
          isMonthlyUpdate={isMonthlyUpdate}
          initialPrefs={prefs || undefined}
        />
      )}
    </div>
  );
}
