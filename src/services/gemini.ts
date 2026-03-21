import { GoogleGenAI, Type } from "@google/genai";
import { FitnessPlan, UserPreferences } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateFitnessPlan(prefs: UserPreferences): Promise<FitnessPlan> {
  const prompt = `
    You are FitGenie, an expert AI fitness coach and nutritionist.
    A user has provided their preferences and potentially an InBody scan image.
    
    User Preferences:
    - Fitness Level: ${prefs.level}
    - Training Days per Week: ${prefs.daysPerWeek}
    - Training Location: ${prefs.location}
    - Injuries/Conditions: ${prefs.injuries || 'None'}
    - Wants Diet Plan: ${prefs.wantsDietPlan ? 'Yes' : 'No'}
    - Favorite Food: ${prefs.favoriteFood || 'None specified'}
    - Available Healthy Food: ${prefs.availableFood || 'None specified'}
    
    Based on this information (and the InBody scan if provided), create a highly personalized, varied workout plan.
    If they want a diet plan, provide a healthy meal plan.
    Provide clear instructions for each exercise and a search query to find a video tutorial.
    The workout should be different each day if possible to ensure variety.
    
    CRITICAL INSTRUCTIONS:
    1. Adjust the workout intensity, sets, and reps specifically for a ${prefs.level} level.
    2. EXACTLY 6 main exercises per day.
    3. Include a 5-10 minute warm-up routine (light cardio + dynamic stretches) before the main exercises.
    4. Include a cooldown routine (10-15 minutes of cardio + static stretches for recovery) after the main exercises.
    5. DIET PLAN RULES:
       - Ensure HUGE variety in the healthy meals. Do not repeat the same meals.
       - If the user provided "Available Healthy Food", prioritize creating meals using those ingredients.
       - If the user provided a "Favorite Food", include a healthy version of it as ONE OF THE MAIN MEALS (e.g., Lunch). DO NOT output a separate favorite food section.
       - A "Snack" MUST be under 250 calories and be a light item (e.g., fruit, nuts, yogurt). It CANNOT be a heavy meal like chicken, meat, or rice.
       - "Breakfast" and "Lunch" should be appropriately sized. Lunch can contain heavy meats (chicken, beef, etc.).
       - "Dinner" MUST be light. DO NOT include heavy meats like beef or chicken in Dinner. Fish or Tuna is acceptable for Dinner, along with salads, eggs, or cottage cheese.
       - Include the estimated calories for each meal.
    
    Respond strictly in JSON format matching the provided schema.
    IMPORTANT: Write all text content (analysis, instructions, meal names, suggestions, etc.) in ${prefs.language === 'ar' ? 'Arabic' : 'English'}.
  `;

  const parts: any[] = [{ text: prompt }];

  if (prefs.inbodyImage && prefs.inbodyMimeType) {
    parts.push({
      inlineData: {
        data: prefs.inbodyImage,
        mimeType: prefs.inbodyMimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysisSummary: {
            type: Type.STRING,
            description: "A brief summary of the user's profile and the strategy for their plan based on their inputs and InBody scan (if provided).",
          },
          workoutPlan: {
            type: Type.OBJECT,
            properties: {
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayName: { type: Type.STRING, description: "e.g., Day 1: Upper Body Focus" },
                    warmup: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          sets: { type: Type.NUMBER },
                          reps: { type: Type.STRING, description: "e.g., 10-12 or 30 seconds" },
                          instructions: { type: Type.STRING, description: "Brief instructions on how to perform the exercise correctly." },
                          youtubeSearchQuery: { type: Type.STRING, description: "A specific search query to find a good tutorial video for this exercise." },
                        },
                        required: ["name", "sets", "reps", "instructions", "youtubeSearchQuery"]
                      }
                    },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          sets: { type: Type.NUMBER },
                          reps: { type: Type.STRING, description: "e.g., 10-12 or 30 seconds" },
                          instructions: { type: Type.STRING, description: "Brief instructions on how to perform the exercise correctly." },
                          youtubeSearchQuery: { type: Type.STRING, description: "A specific search query to find a good tutorial video for this exercise." },
                        },
                        required: ["name", "sets", "reps", "instructions", "youtubeSearchQuery"]
                      }
                    },
                    cooldown: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          sets: { type: Type.NUMBER },
                          reps: { type: Type.STRING, description: "e.g., 10-12 or 30 seconds" },
                          instructions: { type: Type.STRING, description: "Brief instructions on how to perform the exercise correctly." },
                          youtubeSearchQuery: { type: Type.STRING, description: "A specific search query to find a good tutorial video for this exercise." },
                        },
                        required: ["name", "sets", "reps", "instructions", "youtubeSearchQuery"]
                      }
                    }
                  },
                  required: ["dayName", "warmup", "exercises", "cooldown"]
                }
              }
            },
            required: ["days"]
          },
          dietPlan: {
            type: Type.OBJECT,
            properties: {
              meals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    mealName: { type: Type.STRING, description: "e.g., Breakfast, Lunch, Snack" },
                    suggestion: { type: Type.STRING, description: "Healthy meal suggestion." },
                    calories: { type: Type.NUMBER, description: "Estimated calories for this meal." }
                  },
                  required: ["mealName", "suggestion", "calories"]
                }
              }
            },
            required: ["meals"]
          }
        },
        required: ["analysisSummary", "workoutPlan"]
      }
    }
  });

  const jsonStr = response.text || "{}";
  try {
    return JSON.parse(jsonStr) as FitnessPlan;
  } catch (e) {
    console.error("Failed to parse JSON response", e);
    throw new Error("Failed to generate plan. Please try again.");
  }
}

export async function generateAlternativeMeal(mealName: string, currentSuggestion: string, prefs: UserPreferences, customIngredients: string = ""): Promise<{suggestion: string, calories: number}> {
  const prompt = `
    You are FitGenie, an expert AI fitness coach and nutritionist.
    The user didn't like this meal suggestion for ${mealName}: "${currentSuggestion}".
    ${customIngredients ? `The user wants to use these specific ingredients for the new meal: "${customIngredients}".` : `Available healthy food they have: ${prefs.availableFood || 'not specified'}.`}
    
    CRITICAL INSTRUCTION: You are replacing a meal named "${mealName}". You MUST provide a meal of the EXACT SAME CATEGORY and portion size.
    - If "${mealName}" is a snack, you MUST provide a light snack (under 250 calories, e.g., nuts, fruit, yogurt). DO NOT provide a heavy meal like chicken and rice.
    - If "${mealName}" is breakfast, provide breakfast food.
    - If "${mealName}" is lunch, provide a full meal (can include chicken, beef, etc.).
    - If "${mealName}" is dinner, it MUST be light. DO NOT include heavy meats like beef or chicken. Tuna, fish, eggs, or light dairy are acceptable.
    Failure to match the meal size and category will ruin the diet plan.
    
    Respond strictly in JSON format matching the schema.
    IMPORTANT: Write the suggestion text in ${prefs.language === 'ar' ? 'Arabic' : 'English'}.
  `;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestion: { type: Type.STRING, description: "The new meal suggestion." },
          calories: { type: Type.NUMBER, description: "Estimated calories for this meal." }
        },
        required: ["suggestion", "calories"]
      }
    }
  });
  
  const jsonStr = response.text || "{}";
  try {
    return JSON.parse(jsonStr) as {suggestion: string, calories: number};
  } catch (e) {
    console.error("Failed to parse alternative meal JSON", e);
    return { suggestion: "Could not generate alternative.", calories: 0 };
  }
}
