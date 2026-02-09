import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error('Error: VITE_GEMINI_API_KEY not found in .env.local');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    const modelsToTest = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-pro-latest"];

    for (const modelName of modelsToTest) {
        console.log(`\nTesting ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you working?");
            console.log(`✅ Success [${modelName}]:`, result.response.text().slice(0, 50) + "...");
            // If success, we found a winner, but let's test others just in case
        } catch (error) {
            console.error(`❌ Failed [${modelName}]:`, error.message.split('\n')[0]);
        }
    }
}

listModels();
