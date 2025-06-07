import { GoogleGenAI } from "@google/genai";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post("/gemini", async (req, res) => {
  const prompt = req.body.prompt;
  const response = await main(prompt);
  res.send(response);
});

const ai = new GoogleGenAI({ apiKey: "AIzaSyACqNHAFiaMe3L5iL9PQgT0ZCstOaOky84" });

async function main(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error:', error);
    return 'Sorry, there was an error processing your request.';
  }
}

// await main("Explain how AI works in a few words");

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});