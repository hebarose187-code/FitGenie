import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, ArrowRight, Activity, Home, Dumbbell, Utensils, AlertCircle, Target, User, Clock } from 'lucide-react';
import { UserPreferences, Language } from '../types';
import { i18n } from '../i18n';

interface Props {
  onComplete: (prefs: UserPreferences) => void;
  language: Language;
  isMonthlyUpdate?: boolean;
  initialPrefs?: UserPreferences;
}

export default function Onboarding({ onComplete, language, isMonthlyUpdate, initialPrefs }: Props) {
  const t = i18n[language];
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<Partial<UserPreferences>>(initialPrefs || {
    name: '',
    age: '',
    gender: 'Male',
    reminderTime: 'Morning',
    daysPerWeek: 3,
    location: 'Gym',
    wantsDietPlan: true,
    injuries: '',
    favoriteFood: '',
    availableFood: '',
    level: 'Beginner',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const base64String = canvas.toDataURL(file.type || 'image/jpeg', 0.8);
          setPreviewUrl(base64String);
          
          const match = base64String.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (match) {
            setPrefs(prev => ({
              ...prev,
              inbodyMimeType: match[1],
              inbodyImage: match[2]
            }));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 8));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = () => {
    onComplete({ ...prefs, language } as UserPreferences);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            {t.title}
          </h1>
          <div className="text-sm text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">{t.step} {step} {t.of} 8</div>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{t.welcomeFriend}</h2>
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">{t.whatsYourName}</label>
              <div className="relative">
                <User className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                <input 
                  type="text"
                  value={prefs.name}
                  onChange={(e) => setPrefs(p => ({ ...p, name: e.target.value }))}
                  placeholder={t.namePlaceholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 pl-12 rtl:pl-4 rtl:pr-12 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">{t.age}</label>
                <input 
                  type="number"
                  value={prefs.age}
                  onChange={(e) => setPrefs(p => ({ ...p, age: e.target.value }))}
                  placeholder={t.agePlaceholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">{t.gender}</label>
                <select 
                  value={prefs.gender}
                  onChange={(e) => setPrefs(p => ({ ...p, gender: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                >
                  <option value="Male">{t.male}</option>
                  <option value="Female">{t.female}</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold">{isMonthlyUpdate ? t.monthlyUpdate : t.uploadInbody}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">{isMonthlyUpdate ? t.monthlyUpdateDesc : t.uploadDesc}</p>
            
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="space-y-4">
                  <img src={previewUrl} alt="InBody Preview" className="max-h-48 mx-auto rounded-lg object-contain shadow-lg shadow-emerald-500/10" />
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">{t.imageUploaded}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 font-medium">{t.clickDrag}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold">{t.trainingPrefs}</h2>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">{t.whereTrain}</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setPrefs(p => ({ ...p, location: 'Gym' }))}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${prefs.location === 'Gym' ? 'border-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:border-white text-zinc-900 dark:text-white' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 text-zinc-500 dark:text-zinc-400'}`}
                >
                  <Dumbbell className="w-8 h-8" />
                  <span className="font-medium">{t.gym}</span>
                </button>
                <button 
                  onClick={() => setPrefs(p => ({ ...p, location: 'Home' }))}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${prefs.location === 'Home' ? 'border-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:border-white text-zinc-900 dark:text-white' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 text-zinc-500 dark:text-zinc-400'}`}
                >
                  <Home className="w-8 h-8" />
                  <span className="font-medium">{t.home}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">{t.daysPerWeek}: {prefs.daysPerWeek}</label>
              <input 
                type="range" 
                min="1" max="7" 
                value={prefs.daysPerWeek}
                onChange={(e) => setPrefs(p => ({ ...p, daysPerWeek: parseInt(e.target.value) }))}
                className="w-full accent-zinc-900 dark:accent-white"
              />
              <div className="flex justify-between text-xs text-zinc-500 font-mono">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold">{t.fitnessLevel}</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setPrefs(p => ({ ...p, level: 'Beginner' }))}
                  className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${prefs.level === 'Beginner' ? 'border-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:border-white text-zinc-900 dark:text-white' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 text-zinc-500 dark:text-zinc-400'}`}
                >
                  <Target className="w-6 h-6 shrink-0" />
                  <span className="font-medium text-lg">{t.beginner}</span>
                </button>
                <button 
                  onClick={() => setPrefs(p => ({ ...p, level: 'Intermediate' }))}
                  className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${prefs.level === 'Intermediate' ? 'border-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:border-white text-zinc-900 dark:text-white' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 text-zinc-500 dark:text-zinc-400'}`}
                >
                  <Target className="w-6 h-6 shrink-0" />
                  <span className="font-medium text-lg">{t.intermediate}</span>
                </button>
                <button 
                  onClick={() => setPrefs(p => ({ ...p, level: 'Advanced' }))}
                  className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${prefs.level === 'Advanced' ? 'border-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:border-white text-zinc-900 dark:text-white' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 text-zinc-500 dark:text-zinc-400'}`}
                >
                  <Target className="w-6 h-6 shrink-0" />
                  <span className="font-medium text-lg">{t.advanced}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold">{t.healthInjuries}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t.injuriesDesc}</p>
            
            <div className="relative">
              <AlertCircle className="absolute left-4 rtl:left-auto rtl:right-4 top-4 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              <textarea 
                value={prefs.injuries}
                onChange={(e) => setPrefs(p => ({ ...p, injuries: e.target.value }))}
                placeholder={t.injuriesPlaceholder}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 pl-12 rtl:pl-4 rtl:pr-12 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all min-h-[120px]"
              />
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold">{t.nutritionPlan}</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={prefs.wantsDietPlan}
                  onChange={(e) => setPrefs(p => ({ ...p, wantsDietPlan: e.target.checked }))}
                  className="w-5 h-5 accent-zinc-900 dark:accent-white rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-900 dark:text-zinc-200">{t.wantDiet}</span>
                  <span className="text-xs text-zinc-500">{t.dietDesc}</span>
                </div>
              </label>
            </div>

            {prefs.wantsDietPlan && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4">
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">{t.favFood}</label>
                <div className="relative">
                  <Utensils className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                  <input 
                    type="text"
                    value={prefs.favoriteFood}
                    onChange={(e) => setPrefs(p => ({ ...p, favoriteFood: e.target.value }))}
                    placeholder={t.favFoodPlaceholder}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 pl-12 rtl:pl-4 rtl:pr-12 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                  />
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400/80">{t.favFoodDesc}</p>
                
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">{t.availableFood}</label>
                  <div className="relative mt-2">
                    <Utensils className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                    <input 
                      type="text"
                      value={prefs.availableFood}
                      onChange={(e) => setPrefs(p => ({ ...p, availableFood: e.target.value }))}
                      placeholder={t.availableFoodPlaceholder}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 pl-12 rtl:pl-4 rtl:pr-12 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">{t.availableFoodDesc}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 7 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold">{t.reminderTime}</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setPrefs(p => ({ ...p, reminderTime: 'Morning' }))}
                  className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${prefs.reminderTime === 'Morning' ? 'border-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:border-white text-zinc-900 dark:text-white' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 text-zinc-500 dark:text-zinc-400'}`}
                >
                  <Clock className="w-6 h-6 shrink-0" />
                  <span className="font-medium text-lg">{t.morning}</span>
                </button>
                <button 
                  onClick={() => setPrefs(p => ({ ...p, reminderTime: 'Afternoon' }))}
                  className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${prefs.reminderTime === 'Afternoon' ? 'border-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:border-white text-zinc-900 dark:text-white' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 text-zinc-500 dark:text-zinc-400'}`}
                >
                  <Clock className="w-6 h-6 shrink-0" />
                  <span className="font-medium text-lg">{t.afternoon}</span>
                </button>
                <button 
                  onClick={() => setPrefs(p => ({ ...p, reminderTime: 'Evening' }))}
                  className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${prefs.reminderTime === 'Evening' ? 'border-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:border-white text-zinc-900 dark:text-white' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 text-zinc-500 dark:text-zinc-400'}`}
                >
                  <Clock className="w-6 h-6 shrink-0" />
                  <span className="font-medium text-lg">{t.evening}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 8 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center py-8">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
              <Activity className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">{t.ready}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">{t.readyDesc}</p>
          </motion.div>
        )}

        <div className="flex justify-between mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="px-6 py-3 rounded-xl font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              {t.back}
            </button>
          ) : <div></div>}
          
          {step < 8 ? (
            <button 
              onClick={nextStep}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl font-semibold flex items-center gap-2 transition-colors"
            >
              {t.next} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
            >
              {t.generate}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
