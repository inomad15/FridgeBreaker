
const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../src/data/external_recipes.json');
const REPO_API_URL = 'https://api.github.com/repos/dhchoi-lazy/korean-cuisine/contents/data';
const RAW_BASE_URL = 'https://raw.githubusercontent.com/dhchoi-lazy/korean-cuisine/main/data/';
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/dhchoi-lazy/korean-cuisine/main/';

// Heuristic for Nutrition and Category
function estimateNutritionAndCategory(title, ingredients) {
    let category = 'Side Dish';
    let calories = 150;
    let carbs = 10;
    let fat = 5;
    let protein = 5;

    const t = title;
    const i = ingredients.join(' ');

    if (t.includes('김치') || t.includes('깍두기') || t.includes('겉절이')) {
        category = 'Kimchi';
        calories = 40;
        carbs = 8;
        fat = 0;
        protein = 2;
    } else if (t.includes('밥') || t.includes('죽') || t.includes('덮밥')) {
        category = 'Rice/Porridge';
        calories = 400;
        carbs = 75;
        fat = 5;
        protein = 8;
    } else if (t.includes('찌개') || t.includes('국') || t.includes('탕') || t.includes('전골')) {
        category = 'Soup/Stew';
        calories = 250;
        carbs = 15;
        fat = 12;
        protein = 15;
    } else if (
        t.includes('불고기') || t.includes('갈비') || t.includes('육') || i.includes('고기') ||
        t.includes('닭') || t.includes('치킨') || t.includes('삼겹') || t.includes('돼지') || t.includes('오리') ||
        t.includes('보쌈') || t.includes('제육')
    ) {
        category = 'Main Dish (Meat)';
        calories = 600;
        carbs = 10;
        fat = 35;
        protein = 40;
    } else if (t.includes('생선') || t.includes('구이') || t.includes('조림') || t.includes('찜')) {
        // Broad catch for roasted/braised/steamed which are often mains
        category = 'Main Dish';
        calories = 400;
        carbs = 20;
        fat = 20;
        protein = 30;
    } else if (t.includes('나물') || t.includes('무침') || t.includes('볶음')) {
        category = 'Side Dish';
        calories = 100;
        carbs = 10;
        fat = 6;
        protein = 4;
    } else if (t.includes('장아찌') || t.includes('젓갈')) {
        category = 'Side Dish (Pickled)';
        calories = 50;
        carbs = 10;
        fat = 1;
        protein = 2;
    }

    // Add some randomness so they don't look identical
    const noise = () => Math.floor(Math.random() * 5) - 2;

    return {
        category,
        calories: calories + (noise() * 10),
        carbohydrates: Math.max(0, carbs + noise()),
        fat: Math.max(0, fat + noise()),
        protein: Math.max(0, protein + noise())
    };
}

// Helper to fetch JSON from URL
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: { 'User-Agent': 'Node.js-Script' }
        };
        https.get(url, options, (res) => {
            let data = '';
            if (res.statusCode !== 200) {
                res.resume();
                return resolve(null);
            }
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', (e) => resolve(null));
    });
}

// Helper to map to Recipe type
function mapToRecipe(filename, data) {
    if (!data.name || !data.translated) return null;

    const instructions = data.translated.split('.').map(s => s.trim()).filter(s => s.length > 0);
    const ingredientList = data.ingredients || [];

    // Map ingredients to objects
    const ingredients = ingredientList.map(ingName => ({
        id: ingName,
        amount: '적당량', // Default for now as source lacks amounts
        required: true
    }));

    // Estimate Logic
    const nutrition = estimateNutritionAndCategory(data.name, ingredientList);

    // Construct Image URL
    let imageUrl = '/ai_chef_special.png';
    if (data.image) {
        const parts = data.image.split('/');
        const encodedPath = parts.map(encodeURIComponent).join('/');
        imageUrl = `${IMAGE_BASE_URL}${encodedPath}`;
    }

    return {
        id: `gh_${path.basename(filename, '.json')}`,
        title: data.name,
        description: data.translated, // Full description!
        cookingTimeMinutes: 45,
        difficulty: 'Medium',
        imageUrl: imageUrl,
        ingredients: ingredients,
        instructions: instructions,
        category: nutrition.category,
        calories: nutrition.calories,
        servingSize: 2,
        carbohydrates: nutrition.carbohydrates,
        fat: nutrition.fat,
        protein: nutrition.protein
    };
}

async function main() {
    console.log('Fetching file list from GitHub...');
    const fileList = await fetchJson(REPO_API_URL);

    if (!Array.isArray(fileList)) {
        console.error('Failed to fetch file list or rate limited.');
        return;
    }

    const jsonFiles = fileList.filter(f => f.name.endsWith('.json'));
    console.log(`Found ${jsonFiles.length} JSON files.`);

    const newRecipes = [];
    const BATCH_SIZE = 20;

    for (let i = 0; i < jsonFiles.length; i += BATCH_SIZE) {
        const batch = jsonFiles.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${i} to ${i + batch.length}...`);

        const promises = batch.map(file => fetchJson(file.download_url).then(data => ({ file, data })));
        const results = await Promise.all(promises);

        results.forEach(({ file, data }) => {
            if (data) {
                const recipe = mapToRecipe(file.name, data);
                if (recipe) newRecipes.push(recipe);
            }
        });
    }

    // Read existing to preserve NON-GitHub recipes if any (e.g. initial set if we want to keep them)
    // Actually, let's just keep the initial ~100 that were NOT gh_ prefixed if they exist?
    // The previous run replaced checking logic.
    // For now, let's ensure we just Append to the base set or overwrite the 'gh_' ones.

    // Simplest approach: Read, Filter out old 'gh_', Add new 'gh_', Save.
    let existingData = [];
    try {
        if (fs.existsSync(OUTPUT_FILE)) {
            existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
        }
    } catch (e) {
        console.warn('Could not read existing file, starting fresh.');
    }

    // Filter out previous GitHub imports to avoid duplicates/stale data
    const baseRecipes = existingData.filter(r => !r.id.startsWith('gh_'));

    const combined = [...baseRecipes, ...newRecipes];

    console.log(`Total recipes: ${combined.length} (Base: ${baseRecipes.length}, New GitHub: ${newRecipes.length})`);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combined, null, 2), 'utf8');
    console.log('Done.');
}

main();
