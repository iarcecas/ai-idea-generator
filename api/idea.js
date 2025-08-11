import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST allowed" });
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "Topic is required" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gemini-1.5-flash", 
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that suggests content ideas.",
        },
        { role: "user", content: `Generate 5 creative content ideas about "${topic}".` },
      ],
    });
    const text = completion.choices[0].message.content;
    const ideas = text
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => l.replace(/^[\d\.\-\)]+/, "").trim());
    res.status(200).json({ ideas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}