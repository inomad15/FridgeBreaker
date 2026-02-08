import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Define Known Ingredients (from src/constants.tsx)
const INGREDIENTS = [
    { id: 'kimchi', name: '김치' },
    { id: 'onion', name: '양파' },
    { id: 'green_onion', name: '대파' },
    { id: 'garlic', name: '다진마늘' },
    { id: 'potato', name: '감자' },
    { id: 'carrot', name: '당근' },
    { id: 'zucchini', name: '애호박' },
    { id: 'bean_sprout', name: '콩나물' },
    { id: 'tofu', name: '두부' },
    { id: 'radish', name: '무' },
    { id: 'mushroom', name: '버섯' },
    { id: 'cucumber', name: '오이' },
    { id: 'spinach', name: '시금치' },
    { id: 'cabbage', name: '양배추' },
    { id: 'strawberry', name: '딸기' },
    { id: 'dandelion', name: '민들레' },
    { id: 'yam', name: '산마' }, // '산마(마)' handled by substring check mostly
    { id: 'lettuce', name: '양상추' },
    { id: 'pork_belly', name: '돼지고기' }, // Broad matching
    { id: 'pork_shoulder', name: '돼지고기' },
    { id: 'beef', name: '소고기' },
    { id: 'spam', name: '스팸' },
    { id: 'smoked_duck', name: '훈제오리' },
    { id: 'egg', name: '계란' },
    { id: 'chicken', name: '닭고기' },
    { id: 'minced_pork', name: '다짐육' },
    { id: 'tuna_can', name: '참치' },
    { id: 'anchovy', name: '멸치' },
    { id: 'squid', name: '오징어' },
    { id: 'fish_cake', name: '어묵' },
    { id: 'shrimp', name: '새우' },
    { id: 'flatfish', name: '광어' },
    { id: 'spanish_mackerel', name: '삼치' },
    { id: 'rice_cake', name: '떡' },
    { id: 'broccoli', name: '브로콜리' },
    { id: 'cauliflower', name: '컬리플라워' },
    { id: 'kidney_bean', name: '강낭콩' },
    // Add broad matches for essential items if needed, but usually we care about main ingredients
];

// 2. Load External Data
const filePath = path.join(__dirname, '../src/data/external_recipes.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const recipes = JSON.parse(rawData);

// 3. Analyze
const problematicRecipes = [];

recipes.forEach(recipe => {
    const missingIngredients = [];

    INGREDIENTS.forEach(ing => {
        // Simple inclusion check. 
        // e.g. Title: "Kimchi Stew", Ingredient: "Kimchi" -> Match
        if (recipe.title.includes(ing.name)) {
            // Check if ingredient ID exists in recipe.ingredients
            // We also check for 'pork_belly' vs 'pork_shoulder' ambiguity by checking if ANY ID with that name exists?
            // For simplicity, we check if ANY ingredient in the list matches the intended ID.
            // But wait, "돼지고기" maps to two IDs. We should check if *either* is present.

            // Allow flexibility: if title says "Pork" (돼지고기), we accept 'pork_belly' OR 'pork_shoulder' OR 'minced_pork'
            // We can group IDs by name or just special case it. 
            // Let's keep it simple: strict check, but handle mapped IDs.

            const isPresent = recipe.ingredients.some(ri => ri.id === ing.id);

            // Special handling for shared names
            if (!isPresent) {
                if (ing.name === '돼지고기' && recipe.ingredients.some(ri => ri.id.includes('pork'))) return;
                if (ing.name === '참치' && recipe.ingredients.some(ri => ri.id === 'tuna_can')) return;

                missingIngredients.push(ing.name);
            }
        }
    });

    if (missingIngredients.length > 0) {
        problematicRecipes.push({
            id: recipe.id,
            title: recipe.title,
            missing: missingIngredients
        });
    }

    // Manual check removed (handled by general logic now)
});

// 4. Report
console.log(`Analyzed ${recipes.length} recipes.`);
console.log(`Found ${problematicRecipes.length} potential issues.`);

if (problematicRecipes.length > 0) {
    console.log("\n--- Problematic Recipes ---");
    problematicRecipes.forEach(p => {
        console.log(`[${p.title}] Missing: ${p.missing.join(', ')} (ID: ${p.id})`);
    });

    // Write detailed report
    const reportPath = path.join(__dirname, '../recipe_analysis_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(problematicRecipes, null, 2));
    console.log(`\nDetailed report saved to: ${reportPath}`);
}
