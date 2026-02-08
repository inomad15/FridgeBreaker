import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Define Name-to-ID Mapping (Subset of INGREDIENTS or just what's needed)
const NAME_TO_ID = {
    '김치': 'kimchi',
    '양파': 'onion',
    '대파': 'green_onion',
    '다진마늘': 'garlic',
    '감자': 'potato',
    '당근': 'carrot',
    '애호박': 'zucchini',
    '콩나물': 'bean_sprout',
    '두부': 'tofu',
    '무': 'radish',
    '버섯': 'mushroom',
    '오이': 'cucumber',
    '시금치': 'spinach',
    '양배추': 'cabbage',
    '딸기': 'strawberry',
    '민들레': 'dandelion',
    '산마': 'yam',
    '양상추': 'lettuce',
    '돼지고기': 'pork_belly', // Defaulting to belly if ambiguous, or shoulder
    '소고기': 'beef',
    '스팸': 'spam',
    '훈제오리': 'smoked_duck',
    '계란': 'egg',
    '닭고기': 'chicken',
    '다짐육': 'minced_pork',
    '참치': 'tuna_can',
    '멸치': 'anchovy',
    '오징어': 'squid',
    '어묵': 'fish_cake',
    '새우': 'shrimp',
    '광어': 'flatfish',
    '삼치': 'spanish_mackerel',
    '떡': 'rice_cake',
    '브로콜리': 'broccoli',
    '컬리플라워': 'cauliflower',
    '강낭콩': 'kidney_bean'
};

const externalDataPath = path.join(__dirname, '../src/data/external_recipes.json');
const reportPath = path.join(__dirname, '../recipe_analysis_report.json');

if (!fs.existsSync(reportPath)) {
    console.error("Report file not found!");
    process.exit(1);
}

const rawExternalData = fs.readFileSync(externalDataPath, 'utf8');
let recipes = JSON.parse(rawExternalData);

const rawReport = fs.readFileSync(reportPath, 'utf8');
const report = JSON.parse(rawReport);

let fixCount = 0;

report.forEach(item => {
    const recipe = recipes.find(r => r.id === item.id);
    if (!recipe) return;

    item.missing.forEach(missingName => {
        const id = NAME_TO_ID[missingName];
        if (id) {
            // Check again if it exists to be safe
            if (!recipe.ingredients.some(ri => ri.id === id)) {
                recipe.ingredients.push({
                    id: id,
                    amount: '적당량',
                    required: true
                });
                console.log(`Fixed [${recipe.title}]: Added ${missingName} (${id})`);
                fixCount++;
            }
        } else {
            console.warn(`Could not map name '${missingName}' to ID for recipe '${recipe.title}'`);
        }
    });
});

if (fixCount > 0) {
    fs.writeFileSync(externalDataPath, JSON.stringify(recipes, null, 2), 'utf8');
    console.log(`\nSuccessfully fixed ${fixCount} missing ingredients across ${report.length} recipes.`);
}

// Manual Fix for "Broccoli Cauliflower Salad" (api_94)
// This is run regardless of the report, to ensure these specific items are present.
const broccoliSalad = recipes.find(r => r.id === 'api_94');
if (broccoliSalad) {
    const manualAdds = [
        { id: 'broccoli', amount: '1/2개' },
        { id: 'cauliflower', amount: '1/4개' },
        { id: 'kidney_bean', amount: '30g' },
        { id: 'milk', amount: '100ml' } // Soy Milk substitute
    ];

    let manualFixCount = 0;
    manualAdds.forEach(item => {
        if (!broccoliSalad.ingredients.some(ri => ri.id === item.id)) {
            broccoliSalad.ingredients.push({
                id: item.id,
                amount: item.amount,
                required: true
            });
            manualFixCount++;
        }
    });

    if (manualFixCount > 0) {
        fs.writeFileSync(externalDataPath, JSON.stringify(recipes, null, 2), 'utf8');
        console.log(`\nManually fixed 'api_94' (Broccoli Salad) with ${manualFixCount} ingredients.`);
    }
} else {
    console.log("\nCould not find 'api_94' for manual fix.");
}

// Manual Fix for "Baek-Kimchi Congbiji Stew" (api_273)
const congbijiStew = recipes.find(r => r.id === 'api_273');
if (congbijiStew) {
    // Add Congbiji
    const manualAdds = [
        { id: 'congbiji', amount: '200g' }
    ];

    let manualFixCount = 0;
    manualAdds.forEach(item => {
        if (!congbijiStew.ingredients.some(ri => ri.id === item.id)) {
            congbijiStew.ingredients.push({
                id: item.id,
                amount: item.amount,
                required: true
            });
            manualFixCount++;
        }
    });

    if (manualFixCount > 0) {
        fs.writeFileSync(externalDataPath, JSON.stringify(recipes, null, 2), 'utf8');
        console.log(`\nManually fixed 'api_273' (Congbiji Stew) with ${manualFixCount} ingredients.`);
    }
}
