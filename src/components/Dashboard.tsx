import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FitnessPlan, WorkoutDay, Exercise, UserPreferences, Language } from '../types';
import { Calendar, PlayCircle, CheckCircle2, Utensils, Info, ArrowLeft, Bell, RefreshCw, RefreshCcw, Flame, Dumbbell, Wind } from 'lucide-react';
import { i18n } from '../i18n';
import { generateAlternativeMeal } from '../services/gemini';

interface Props {
  plan: FitnessPlan;
  prefs: UserPreferences;
  onReset: () => void;
  onMonthlyUpdate: () => void;
  language: Language;
}

export default function Dashboard({ plan, prefs, onReset, onMonthlyUpdate, language }: Props) {
  const t = i18n[language];
  const [activeTab, setActiveTab] = useState<'workout' | 'diet'>('workout');
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [localPlan, setLocalPlan] = useState<FitnessPlan>(plan);
  const [swappingMealIdx, setSwappingMealIdx] = useState<number | null>(null);
  const [customIngredients, setCustomIngredients] = useState<string>('');

  const handleSetReminder = () => {
    alert(t.reminderSet);
  };

  const handleSwapMeal = async (idx: number, mealName: string, currentSuggestion: string) => {
    setSwappingMealIdx(idx);
    try {
      const newMeal = await generateAlternativeMeal(mealName, currentSuggestion, prefs, customIngredients);
      setLocalPlan(prev => {
        const newPlan = { ...prev };
        if (newPlan.dietPlan) {
          newPlan.dietPlan.meals[idx].suggestion = newMeal.suggestion;
          newPlan.dietPlan.meals[idx].calories = newMeal.calories;
        }
        return newPlan;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSwappingMealIdx(null);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onReset} className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              <span className="hidden sm:inline">{t.startOver}</span>
            </button>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 tracking-tight">
              {prefs.name ? `${t.greeting}, ${prefs.name}!` : t.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onMonthlyUpdate} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 hover:from-emerald-500/20 hover:to-teal-500/20 rounded-xl font-medium transition-colors text-sm border border-emerald-500/20">
              <RefreshCcw className="w-4 h-4" />
              {t.monthlyUpdate}
            </button>
            <button onClick={handleSetReminder} className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-600 dark:text-zinc-300 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Mobile Monthly Update Button */}
        <button onClick={onMonthlyUpdate} className="sm:hidden w-full flex justify-center items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 hover:from-emerald-500/20 hover:to-teal-500/20 rounded-xl font-medium transition-colors text-sm border border-emerald-500/20">
          <RefreshCcw className="w-4 h-4" />
          {t.monthlyUpdate}
        </button>

        {/* Analysis Summary */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm shadow-emerald-500/5"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-xl shrink-0">
              <Info className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">{t.coachAnalysis}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{localPlan.analysisSummary}</p>
            </div>
          </div>
        </motion.section>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-px">
          <button 
            onClick={() => setActiveTab('workout')}
            className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'workout' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            {t.workoutPlan}
            {activeTab === 'workout' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />}
          </button>
          {localPlan.dietPlan && (
            <button 
              onClick={() => setActiveTab('diet')}
              className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'diet' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              {t.dietPlan}
              {activeTab === 'diet' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />}
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'workout' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Day Selector */}
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {localPlan.workoutPlan.days.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(idx)}
                  className={`snap-start shrink-0 px-6 py-3 rounded-xl font-medium transition-all ${selectedDay === idx ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white dark:text-zinc-950 shadow-lg shadow-emerald-500/25 transform -translate-y-0.5' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                >
                  {day.dayName}
                </button>
              ))}
            </div>

            {/* Exercises List */}
            <div className="space-y-8">
              {localPlan.workoutPlan.days[selectedDay]?.warmup && localPlan.workoutPlan.days[selectedDay].warmup.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                    <Flame className="w-5 h-5 text-emerald-500" /> {t.warmup}
                  </h3>
                  <div className="grid gap-4">
                    {localPlan.workoutPlan.days[selectedDay].warmup.map((ex, idx) => (
                      <ExerciseCard key={`warmup-${idx}`} exercise={ex} index={idx} t={t} />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                  <Dumbbell className="w-5 h-5 text-emerald-500" /> {t.mainWorkout}
                </h3>
                <div className="grid gap-4">
                  {localPlan.workoutPlan.days[selectedDay]?.exercises.map((ex, idx) => (
                    <ExerciseCard key={`main-${idx}`} exercise={ex} index={idx} t={t} />
                  ))}
                </div>
              </div>

              {localPlan.workoutPlan.days[selectedDay]?.cooldown && localPlan.workoutPlan.days[selectedDay].cooldown.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                    <Wind className="w-5 h-5 text-emerald-500" /> {t.cooldown}
                  </h3>
                  <div className="grid gap-4">
                    {localPlan.workoutPlan.days[selectedDay].cooldown.map((ex, idx) => (
                      <ExerciseCard key={`cooldown-${idx}`} exercise={ex} index={idx} t={t} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm shadow-emerald-500/5">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <Utensils className="w-4 h-4 text-emerald-500" />
                {t.customIngredients}
              </h3>
              <input 
                type="text"
                value={customIngredients}
                onChange={(e) => setCustomIngredients(e.target.value)}
                placeholder={t.customIngredientsPlaceholder}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Meals */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                  <Utensils className="w-5 h-5 text-emerald-500" /> {t.dailyMeals}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {localPlan.dietPlan?.meals.map((meal, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm shadow-emerald-500/5 flex flex-col hover:border-emerald-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-emerald-600 dark:text-emerald-400">{meal.mealName}</h4>
                          {meal.calories && (
                            <span className="text-xs font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded mt-1 inline-block border border-emerald-500/20">
                              {meal.calories} {t.kcal}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleSwapMeal(idx, meal.mealName, meal.suggestion)}
                          disabled={swappingMealIdx === idx}
                          className="text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 text-xs font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/30 px-2.5 py-1.5 rounded-lg"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${swappingMealIdx === idx ? 'animate-spin' : ''}`} />
                          {swappingMealIdx === idx ? t.swapping : t.swapMeal}
                        </button>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed flex-1">{meal.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function ExerciseCard({ exercise, index, t }: { exercise: Exercise; index: number; t: any }) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtubeSearchQuery)}`;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-6 shadow-sm shadow-emerald-500/5 hover:border-emerald-500/30 transition-colors"
    >
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{exercise.name}</h3>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shrink-0">
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{exercise.sets}</span>
            <span className="text-emerald-600/70 dark:text-emerald-400/70 text-sm hidden sm:inline">{t.sets}</span>
            <span className="text-emerald-400 dark:text-emerald-600">×</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{exercise.reps}</span>
            <span className="text-emerald-600/70 dark:text-emerald-400/70 text-sm hidden sm:inline">{t.reps}</span>
          </div>
        </div>
        
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{exercise.instructions}</p>
      </div>
      
      <div className="sm:w-48 flex flex-col justify-center shrink-0">
        <a 
          href={searchUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl transition-colors font-medium text-sm border border-emerald-500/20"
        >
          <PlayCircle className="w-5 h-5 text-emerald-500" />
          {t.watchTutorial}
        </a>
      </div>
    </motion.div>
  );
}
