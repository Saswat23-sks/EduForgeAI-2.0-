import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export default async function handler(req, res) {
  try {
    const { input, options } = req.body;

    if (!input) {
      return res.status(400).json({ error: "No input provided" });
    }

    const SYSTEM_PROMPT = `
You are an expert AI assistant that generates structured undergraduate courses.

Return ONLY valid JSON.
Do not include explanations.
Structure must include modules, lectures, quizzes, assignments.
`;

    const prompt = `
Raw Syllabus:
${input}

Parameters:
- Learning Style: ${options?.learningStyle}
- Class Size: ${options?.classSize}
- Creativity: ${options?.creativity}
`;

    // =========================
    // 🟢 1. TRY GEMINI
    // =========================
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: options?.creativity || 0.7,
        },
      });

      const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
      const response = await result.response;
      const text = response.text();

      console.log("Gemini raw response:", text);

      try {
        const parsed = JSON.parse(text);
        return res.status(200).json(parsed);
      } catch (err) {
        console.log("Gemini JSON parse failed → fallback");
      }

    } catch (err) {
      console.error("Gemini failed:", err);
    }

    // =========================
    // 🔵 2. FALLBACK → GROQ
    // =========================
    try {
      const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });

      const completion = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: options?.creativity || 0.7,
      });

      const text = completion.choices[0].message.content;

      console.log("Groq raw response:", text);

      try {
        const parsed = JSON.parse(text);
        return res.status(200).json(parsed);
      } catch (err) {
        return res.status(200).json({
          fallback: true,
          data: text,
        });
      }

    } catch (err) {
      console.error("Groq failed:", err);
    }

    // =========================
    // ❌ FINAL FAILURE
    // =========================
    return res.status(500).json({
      error: "All AI services failed",
    });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
