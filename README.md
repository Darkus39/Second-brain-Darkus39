# SecondBrain

Your AI-powered second brain — built with Next.js, 3D knowledge graph, and OpenRouter AI.

## Features
- 📊 **Dashboard** — live stats, recent notes, agent status, open tasks
- 🕸️ **3D Knowledge Graph** — interactive, drag to rotate, auto-linked nodes
- 📝 **Notes** — capture with AI auto-tagging & summarization
- ✅ **Tasks** — task manager with progress bar and project linking
- 📁 **Projects** — tracker with status cycling and task linking
- 🤖 **5 AI Agents** — Researcher, Summarizer, Connector, Digest, Custom
- 🌅 **Daily Digest** — AI-generated morning briefing from your knowledge base
- ⚙️ **Settings** — manage your OpenRouter API key and local data

## AI Model Selection
Each agent has its own **model dropdown** — choose from 10 free models on OpenRouter:
- Gemini 2.0 Flash, Gemini 1.5 Flash
- Llama 3.3 70B, Llama 3.1 8B
- Mistral 7B, Phi-3 Mini, Qwen 2 7B
- DeepSeek R1, Hermes 3 405B, OpenChat 7B

If a model gets removed from OpenRouter, just switch to another — no code changes needed.

## No backend required
All AI calls go **directly from your browser to OpenRouter**.  
Your API key is stored in `localStorage` — never on a server.

## Setup

```bash
npm install
npm run dev
```

On first load, enter your OpenRouter API key (get one free at [openrouter.ai/keys](https://openrouter.ai/keys)).

## Deploy to Vercel

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Deploy — **no environment variables needed**

## Stack
- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- Canvas API for 3D graph
- OpenRouter API (browser-direct, 10 free models)
- localStorage (no database)
