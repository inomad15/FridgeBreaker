
/// <reference types="vite/client" />
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Recipe } from '../types';

// Access API Key from environment variables (Vite uses import.meta.env)

// Access API Key from environment variables (Vite uses import.meta.env)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Create a lookup map for faster access or just load the array
import externalRecipesData from '../data/external_recipes.json';
const RECIPE_DB = externalRecipesData as Recipe[];

// System prompt to guide the AI
const SYSTEM_PROMPT = `
You are a creative and practical Korean chef (한식 셰프) specializing in "Fridge Breaking" (냉장고 파먹기).
Your ULTIMATE GOAL is to suggest a delicious recipe that uses **ONLY the user's provided ingredients** + **Basic Pantry Staples**.

### 🚨 CRITICAL RULES (MUST FOLLOW):
1.  **Prioritize User Ingredients**: The recipe MUST be centered around the provided ingredients.
2.  **No Shopping Trips**: Do NOT suggest recipes that require buying new MAIN ingredients (e.g., if user has no meat, do not suggest Bulgogi. If user has no Kimchi, do not suggest Kimchi Stew).
3.  **Allowed "Pantry Staples"**: You may assume the user has these basic items:
    -   *Seasonings*: Salt, Sugar, Pepper, Soy Sauce, Gochujang (Chili Paste), Doenjang (Soybean Paste), Vinegar, Sesame Oil, Cooking Oil.
    -   *Aromatics*: Minced Garlic, Green Onion (optional).
    -   *Basics*: Rice (assume cooked rice exists), Water.
4.  **Strict Mode**: If the user's ingredients are sparse, suggest simple side dishes (Banchan), rice bowls (Deopbap), or creative snacks rather than forcing a complex main dish.
5.  **Creativity**: If the combination is weird, invent a "Fusion" dish but explain WHY it works.

### Reference Recipes:
You will be provided with "Reference Recipes". 
-   **USE THEM ONLY IF** they closely match the user's ingredients.
-   **IGNORE THEM IF** they require too many ingredients the user doesn't have.
-   It is better to invent a simple recipe that fits than to copy a reference that requires a grocery run.

### Output Style:
-   Tone: Encouraging, practical, and slightly witty (like a friendly neighborhood chef).
-   Language: Korean (Natural and appetizing).

Output the recipe STRICTLY in the following JSON format. Do not include markdown formatting like \`\`\`json.
{
  "id": "generated_recipe_timestamp",
  "title": "Recipe Title (Korean)",
  "description": "Short, appetizing description explaining why this is perfect for the current ingredients.",
  "cookingTimeMinutes": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "calories": number (approximate),
  "servingSize": number (e.g. 2),
  "imageUrl": "/ai_chef_special.png", 
  "ingredients": [
    { "id": "ingredient_name", "amount": "quantity", "required": true }
  ],
  "instructions": [
    "Step 1...",
    "Step 2..."
  ]
}
`;

function findBestMatches(userIngredients: string[], limit = 3): Recipe[] {
    if (userIngredients.length === 0) return [];

    // Simple scoring: count how many user ingredients appear in the recipe
    const scored = RECIPE_DB.map(recipe => {
        let score = 0;
        const recipeIngNames = recipe.ingredients.map(i => i.id); // In our data, id is the name

        userIngredients.forEach(ui => {
            if (recipeIngNames.some(ri => ri.includes(ui) || ui.includes(ri))) {
                score++;
            }
        });

        // Bonus for title match
        userIngredients.forEach(ui => {
            if (recipe.title.includes(ui)) score += 2;
        });

        return { recipe, score };
    });

    // Filter out zero scores and sort
    const matches = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => s.recipe);

    return matches;
}

export async function generateRecipe(ingredients: string[]): Promise<Recipe | null> {
    const referenceRecipes = findBestMatches(ingredients);

    // --- MOCK MODE (If no API Key provided) ---
    if (!API_KEY) {
        console.warn("No Gemini API Key found. Returning mock response based on DB.");

        // If we have a DB match, return it directly in mock mode!
        if (referenceRecipes.length > 0) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        ...referenceRecipes[0],
                        id: `ai_${Date.now()}`, // New ID for the session
                        description: `[Mock AI] DB에서 찾은 레시피입니다: ${referenceRecipes[0].description}`
                    });
                }, 1000);
            });
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: `ai_${Date.now()}`,
                    title: `[AI] ${ingredients[0]} 스페셜 요리`,
                    description: "AI 셰프가 당신의 냉장고 재료로 즉석에서 만든 특별한 레시피입니다.",
                    cookingTimeMinutes: 20,
                    difficulty: 'Easy',
                    imageUrl: '/ai_chef_special.png',
                    ingredients: ingredients.map(ing => ({ id: ing, amount: '적당량', required: true })),
                    instructions: [
                        `${ingredients.join(', ')}을(를) 먹기 좋게 손질합니다.`,
                        "달궈진 팬에 기름을 두르고 재료를 볶습니다.",
                        "간장과 설탕으로 간을 맞추고 푹 익힙니다.",
                        "맛있게 드세요!"
                    ],
                    calories: 500,
                    servingSize: 1,

                });
            }, 2000);
        });
    }

    // --- REAL AI GENERATION ---
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        let context = "";
        if (referenceRecipes.length > 0) {
            context = `\n\n[Reference Recipes from Database]\n${JSON.stringify(referenceRecipes.map(r => ({
                title: r.title,
                ingredients: r.ingredients.map(i => i.id),
                instructions: r.instructions,
                calories: r.calories
            })), null, 2)}`;
        }

        const prompt = `${SYSTEM_PROMPT}${context}\n\nUser ingredients: ${ingredients.join(', ')}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("AI Raw Response:", text);

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const recipeData = JSON.parse(cleanText);

        // User provided specific image: "ai_chef_special.png" hardcoded for AI chef
        recipeData.imageUrl = "/ai_chef_special.png";

        // Ensure ID is unique
        recipeData.id = `ai_${Date.now()}`;

        return recipeData as Recipe;

    } catch (error: any) {
        console.error("AI Generation Failed:", error);
        alert(`오류가 발생했습니다: ${error.message || JSON.stringify(error)}`);
        return null;
    }
}
