import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/data/external_recipes.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const recipes = JSON.parse(rawData);

const TITLES_TO_REMOVE = [
    "스트로베리 샐러드",
    "민들레 샐러드",
    "겨자소스로 구운 산마샐러드",
    "광어스테이크",
    "유자삼치구이",
    "훈제오리가슴살 샐러드"
];

const initialCount = recipes.length;
const filteredRecipes = recipes.filter(r => !TITLES_TO_REMOVE.includes(r.title));
const verifyStrawberry = filteredRecipes.find(r => r.title === "스트로베리 샐러드");

console.log(`Initial count: ${initialCount}`);
console.log(`Filtered count: ${filteredRecipes.length}`);
console.log(`Removed: ${initialCount - filteredRecipes.length}`);

if (verifyStrawberry) {
    console.error("ERROR: Strawberry Salad still exists!");
} else {
    fs.writeFileSync(filePath, JSON.stringify(filteredRecipes, null, 2), 'utf8');
    console.log("Successfully removed duplicate recipes.");
}
