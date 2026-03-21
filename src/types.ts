export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';
export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  instructions: string;
  youtubeSearchQuery: string;
  imageUrl?: string;
}

export interface WorkoutDay {
  dayName: string;
  warmup: Exercise[];
  exercises: Exercise[];
  cooldown: Exercise[];
}

export interface Meal {
  mealName: string;
  suggestion: string;
  calories: number;
}

export interface DietPlan {
  meals: Meal[];
  favoriteFoodHealthyVersion?: string;
}

export interface FitnessPlan {
  analysisSummary: string;
  workoutPlan: {
    days: WorkoutDay[];
  };
  dietPlan?: DietPlan;
}

export interface UserPreferences {
  name: string;
  age: string;
  gender: string;
  reminderTime: string;
  inbodyImage?: string; // base64
  inbodyMimeType?: string;
  daysPerWeek: number;
  location: 'Gym' | 'Home';
  injuries: string;
  wantsDietPlan: boolean;
  favoriteFood: string;
  availableFood?: string;
  language: Language;
  level: FitnessLevel;
}
