import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, Timestamp, where } from "firebase/firestore";
import cors from "cors";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize Firebase
  const firebaseApp = initializeApp(firebaseConfig);
  const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

  // Gemini Setup
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI News Collector Route
  app.post("/api/collect-scandals", async (req, res) => {
    try {
      console.log("AI is collecting latest scandals...");
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "日本の行政機関や公務員による最新の不祥事ニュースを、重複なく、必ず正確に10件リストアップしてください。各項目にはタイトル、日付（YYYY/MM/DD形式）、カテゴリ[Administrative/Personal]、詳細な概要（100文字以上）、ソースURL、発生場所を含めてください。JSON形式で出力してください。",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            minItems: 10,
            maxItems: 10,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                date: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                sourceUrl: { type: Type.STRING },
                location: { type: Type.STRING }
              },
              required: ["title", "date", "category", "description", "sourceUrl"]
            }
          }
        }
      });

      const scandals = JSON.parse(response.text);
      const scandalsCollection = collection(db, "scandals");

      // Store in Firestore
      for (const scandal of scandals) {
        // Check if already exists by title
        const q = query(scandalsCollection, where("title", "==", scandal.title));
        const existing = await getDocs(q);
        
        if (existing.empty) {
          await addDoc(scandalsCollection, {
            ...scandal,
            createdAt: Timestamp.now()
          });
        }
      }

      res.json({ message: "Scandals collected and stored.", count: scandals.length });
    } catch (error) {
      console.error("Error collecting scandals:", error);
      res.status(500).json({ error: "Failed to collect scandals." });
    }
  });

  // Get Latest 10 Scandals
  app.get("/api/scandals", async (req, res) => {
    try {
      const scandalsCollection = collection(db, "scandals");
      const q = query(scandalsCollection, orderBy("createdAt", "desc"), limit(10));
      const snapshot = await getDocs(q);
      const scandals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(scandals);
    } catch (error) {
      console.error("Error fetching scandals:", error);
      res.status(500).json({ error: "Failed to fetch scandals." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
