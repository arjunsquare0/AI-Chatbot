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

app.post("/chat", async (req, res) => {
  const prompt = req.body.prompt;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        stream: true
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        res.write('data: [DONE]\n\n');
        break;
      }
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim().length > 0) {
          const json = JSON.parse(line);
          if (json.response) {
            res.write(`data: ${JSON.stringify({ text: json.response })}\n\n`);
          }
        }
      }
    }
    
    res.end();
  } catch (error) {
    console.error('Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'An error occurred' })}\n\n`);
    res.end();
  }
});

// await main("Explain how AI works in a few words");

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});