import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { buildHtmlDocument } from './htmlBuilder.js';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Set up data directory
const DATA_DIR = path.join(__dirname, '../data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

async function ensureDirs() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directories:', err);
  }
}
ensureDirs();

// Serve uploads statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, crypto.randomUUID() + ext)
  }
});
const upload = multer({ storage: storage });

// Neu: Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // HostURL wird beachtet, der Client greift regulär über http://localhost:3001/uploads/... zu
  res.json({ url: `http://localhost:3001/uploads/${req.file.filename}` });
});


// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const files = await fs.readdir(PROJECTS_DIR);
    const projects = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(PROJECTS_DIR, file), 'utf-8');
        projects.push(JSON.parse(content));
      }
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read projects' });
  }
});

// Create or update project
app.post('/api/projects', async (req, res) => {
  try {
    const project = req.body;
    if (!project.id) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    const filePath = path.join(PROJECTS_DIR, `${project.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(project, null, 2));
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// Get a single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const filePath = path.join(PROJECTS_DIR, `${req.params.id}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    res.json(JSON.parse(content));
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Project not found' });
    } else {
      res.status(500).json({ error: 'Failed to load project' });
    }
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const filePath = path.join(PROJECTS_DIR, `${req.params.id}.json`);
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Duplicate project
app.post('/api/projects/:id/duplicate', async (req, res) => {
  try {
    const filePath = path.join(PROJECTS_DIR, `${req.params.id}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    const project = JSON.parse(content);
    
    // Create duplicate
    const newId = crypto.randomUUID();
    const newName = req.body.name || `Kopie von ${project.name}`;
    
    const duplicate = {
      ...project,
      id: newId,
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const newFilePath = path.join(PROJECTS_DIR, `${newId}.json`);
    await fs.writeFile(newFilePath, JSON.stringify(duplicate, null, 2));
    
    res.json({ success: true, project: duplicate });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Project not found' });
    } else {
      res.status(500).json({ error: 'Failed to duplicate project' });
    }
  }
});

// Export HTML
app.post('/api/projects/:id/export/html', async (req, res) => {
  try {
    const filePath = path.join(PROJECTS_DIR, `${req.params.id}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    const project = JSON.parse(content);

    const htmlContent = buildHtmlDocument(project);

    res.setHeader('Content-disposition', `attachment; filename=${project.name.replace(/\\s+/g, '_')}_export.zip`);
    res.setHeader('Content-type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', function(err) {
      throw err;
    });

    archive.pipe(res);
    archive.append(htmlContent, { name: 'index.html' });

    // Finde alle verknüpften lokalen Uploads im fertigen HTML
    // (htmlBuilder schreibt die Pfade auf "./assets/Dateiname.jpg" um)
    const assetMatches = [...htmlContent.matchAll(/assets\/([^'"]+)/g)];
    const uniqueAssets = [...new Set(assetMatches.map(m => m[1]))];

    // Packe die gefundenen Dateien aus dem Backend /uploads Ordner in den ZIP /assets Ordner
    for (const filename of uniqueAssets) {
      const localFilePath = path.join(UPLOADS_DIR, filename);
      if (existsSync(localFilePath)) {
        archive.file(localFilePath, { name: `assets/${filename}` });
      }
    }

    archive.finalize();

  } catch (error) {
    console.error('Export error:', error);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Project not found' });
    } else {
      res.status(500).json({ error: 'Failed to export HTML' });
    }
  }
});

// Export React/Vite
app.post('/api/projects/:id/export/react', async (req, res) => {
  try {
    // Hier würde ein Vite Template-Ordner gezippt und heruntergeladen werden
    res.json({ message: 'React Export not yet fully implemented', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export React project' });
  }
});

// AI Text Generation Endpoint (Magic Wand)
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { blockType, topic } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Returning dummy data.");
      return res.json({
        headline: "[DUMMY] KI Generierte Headline",
        subline: "Bitte trage deinen GEMINI_API_KEY in die .env Datei im server-Ordner ein und starte das Backend neu, um echte KI Antworten zu erhalten.",
        text: "Hier könnte großartiger Copywriting Text stehen."
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemPrompt = `Du bist ein Weltklasse Conversion-Copywriter. Erstelle extrem professionelle, conversion-optimierte deutsche Texte für einen Website-Block vom Typ: "${blockType}". Das Thema lautet: "${topic || 'Allgemeines Marketing'}". Antworte IMMER im JSON-Format. Nutze exakt diese Form: {"headline": "Deine starke Headline", "subline": "Überzeugende Unterüberschrift", "text": "optionaler längerer fließtext"}. Nutze keine Markdown Code-Blöcke \`\`\`, sondern rohes JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text);
    res.json(parsed);
  } catch (error) {
    console.error('AI Generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.listen(PORT, () => {
  console.log(`WebBuilder Server running on http://localhost:${PORT}`);
});
