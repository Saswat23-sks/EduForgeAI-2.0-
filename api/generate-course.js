
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export default async function handler(req, res) {
  const { input, options } = req.body;

  const SYSTEM_PROMPT = "You are an expert pedagogical AI assistant.";

  const prompt = `Raw Syllabus/Topics:
${input}

Parameters:
- Learning Style: ${options?.learningStyle}
- Class Size: ${options?.classSize}
`;

  // Try Gemini
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

    return res.status(200).json(JSON.parse(text));

  } catch (err) {
    console.log("Gemini failed, switching to Groq...");
  }

  // Fallback Groq
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

    return res.status(200).json({
      fallback: true,
      data: text,
    });

  } catch (err) {
    console.error("Both APIs failed:", err);
    return res.status(500).json({
      error: "All AI services failed",
    });
  }
}
