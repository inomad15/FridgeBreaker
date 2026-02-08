
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const API_KEY = process.env.API_KEY || 'sample'; // User needs to provide this used 'sample' for dry-run
const START_INDEX = 1;
const END_INDEX = 100; // Limit to 100 for now to be safe
const API_URL = `http://openapi.foodsafetykorea.go.kr/api/${API_KEY}/COOKRCP01/json/${START_INDEX}/${END_INDEX}`;
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/external_recipes.json');

// --- Mappings ---
// Map Korean ingredient names to our internal IDs
const NAME_TO_ID = {
    '김치': 'kimchi',
    '배추김치': 'kimchi',
    '돼지고기': 'pork_belly', // Defaulting to belly for generic pork
    '삼겹살': 'pork_belly',
    '목살': 'pork_shoulder',
    '쇠고기': 'beef',
    '소고기': 'beef',
    '양파': 'onion',
    '대파': 'green_onion',
    '파': 'green_onion',
    '마늘': 'garlic',
    '다진마늘': 'garlic',
    '감자': 'potato',
    '당근': 'carrot',
    '애호박': 'zucchini',
    '호박': 'zucchini',
    '콩나물': 'bean_sprout',
    '두부': 'tofu',
    '무': 'radish',
    '버섯': 'mushroom',
    '표고버섯': 'mushroom',
    '오이': 'cucumber',
    '시금치': 'spinach',
    '양배추': 'cabbage',
    '스팸': 'spam',
    '햄': 'spam',
    '계란': 'egg',
    '달걀': 'egg',
    '닭고기': 'chicken',
    '닭': 'chicken',
    '참치': 'tuna_can',
    '참치캔': 'tuna_can',
    '멸치': 'anchovy',
    '멸치육수': 'anchovy',
    '오징어': 'squid',
    '어묵': 'fish_cake',
    '새우': 'shrimp',
    '고추장': 'gochujang',
    '간장': 'soy_sauce',
    '진간장': 'soy_sauce',
    '국간장': 'soy_sauce',
    '설탕': 'sugar',
    '참기름': 'sesame_oil',
    '소금': 'salt',
    '후추': 'pepper',
    '고춧가루': 'gochugaru',
    '밥': 'rice',
    '쌀': 'rice',
    '소면': 'noodle',
    '국수': 'noodle',
    '라면': 'ramen',
    '떡': 'rice_cake',
    '떡볶이떡': 'rice_cake',
    '우유': 'milk',
    '치즈': 'cheese'
};

// --- Helpers ---

async function fetchRecipes() {
    console.log(`Fetching recipes from ${API_URL}...`);
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.COOKRCP01 || !data.COOKRCP01.row) {
            console.error("Invalid API response format:", data);
            return [];
        }

        return data.COOKRCP01.row;
    } catch (error) {
        console.error("Failed to fetch recipes:", error);
        return [];
    }
}

function parseIngredients(ingredientString) {
    // Input format example: "돼지고기(50g), 김치(1/4포기), 양파(1/2개)..."
    // Or sometimes just: "돼지고기 50g, 김치 1/4포기..."
    // This is a naive parser.
    const ingredients = [];
    if (!ingredientString) return ingredients;

    // Split by comma
    const parts = ingredientString.split(/,|,\s+/);

    parts.forEach(part => {
        const match = part.trim().match(/^([^\(0-9]+)(?:[\( ](.*)[\)]?)?$/);
        if (match) {
            const rawName = match[1].trim();
            const amount = match[2] ? match[2].replace(/\)/g, '').trim() : '적당량';

            // Map to ID
            let id = null;
            // Try exact match
            if (NAME_TO_ID[rawName]) {
                id = NAME_TO_ID[rawName];
            } else {
                // Try partial match (e.g., '익은 김치' -> 'kimchi')
                for (const [key, val] of Object.entries(NAME_TO_ID)) {
                    if (rawName.includes(key)) {
                        id = val;
                        break;
                    }
                }
            }

            if (id) {
                ingredients.push({
                    id: id,
                    amount: amount,
                    required: true // Assume required for now
                });
            }
        }
    });

    return ingredients;
}

function parseInstructions(item) {
    const instructions = [];
    for (let i = 1; i <= 20; i++) {
        const step = item[`MANUAL${String(i).padStart(2, '0')}`];
        if (step) {
            // Remove "1. " prefix if exists
            instructions.push(step.replace(/^\d+\.\s*/, ''));
        }
    }
    return instructions;
}

function transformData(apiItems) {
    return apiItems.map(item => {
        return {
            id: `api_${item.RCP_SEQ}`,
            title: item.RCP_NM,
            description: item.RCP_PAT2 + " 요리", // e.g. "국&찌개 요리"
            cookingTimeMinutes: 30, // Default, API doesn't usually have this
            difficulty: 'Medium', // Default
            imageUrl: item.ATT_FILE_NO_MAIN || item.ATT_FILE_NO_MK,
            ingredients: parseIngredients(item.RCP_PARTS_DTLS),
            instructions: parseInstructions(item),
            calories: parseFloat(item.INFO_ENG) || 0,
            servingSize: 1 // Default
            // Macros are not always available or reliable in simple summary
        };
    }).filter(recipe => recipe.ingredients.length > 0); // Filter out recipes with no mapped ingredients
}

// --- Main ---

async function main() {
    const apiItems = await fetchRecipes();
    console.log(`Fetched ${apiItems.length} items.`);

    const transformed = transformData(apiItems);
    console.log(`Transformed ${transformed.length} recipes.`);

    // For now, if we are in dry-run with sample key, we might get error or generic data.
    // If empty and using sample, let's just log.

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(transformed, null, 2));
    console.log(`Saved to ${OUTPUT_FILE}`);
}

main();
