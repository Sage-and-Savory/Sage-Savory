import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function main() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: "hello",
        });
        console.log("2.5-pro: " + response.text);
    } catch (e: any) {
        console.log("2.0-flash error:", e.message);
    }
}
main();
