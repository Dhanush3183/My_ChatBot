# 🌌 Agent Dhanush

> Next-Gen Cyberpunk / Sci-Fi Minimalist Static AI Chatbot Interface running entirely in your browser. Fully optimized for GitHub Pages!

![Aesthetic](https://img.shields.io/badge/Aesthetic-Cyberpunk%20%2F%20Sci--Fi-00ffcc?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech%20Stack-HTML5%20%2F%20CSS3%20%2F%20Vanilla%20JS-ff007f?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deployment-GitHub%20Pages-007fbb?style=for-the-badge)
![Engine](https://img.shields.io/badge/Engine-WebGPU%20%2F%20Wiki--Retrieval-violet?style=for-the-badge)

**Agent Dhanush** is a high-fidelity, single-page conversational interface featuring a deep-space cybernetic theme, neon glowing interactive elements, and a dynamic vector **Core Orb** that reacts visually to typing, loading, and speaking states.

---

## 🚀 Architectural Design

Agent Dhanush operates using a **Dual-Engine Pipeline** to guarantee continuous response availability:

```
                  ┌───────────────────────────────┐
                  │       User Input Query        │
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────▼───────────────┐
                  │   Detecting WebGPU Support?   │
                  └──────┬─────────────────┬──────┘
                         │                 │
                [Yes]   │                 │ [No / Fail]
                         ▼                 ▼
          ┌──────────────────────┐ ┌──────────────────────┐
          │  Local WebGPU LLM    │ │  Knowledge Retrieval │
          │ (TinyLlama/Qwen 0.5B)│ │    (Wikipedia API)   │
          └──────────────────────┘ └──────────────────────┘
```

1. **Local WebGPU LLM (Default Selection)**: Loads specialized browser-compiled AI weights directly into your graphics VRAM cache using `@mlc.ai/web-llm` via CDN. Complete client-side privacy.
2. **Offline Knowledge Retrieval Engine (Automatic Fallback)**: If WebGPU allocation fails or is unsupported, the system transparently switches to the Knowledge Engine, querying the free, keyless **Wikipedia Search API** to extract real-world information and answer your questions directly from the frontend.

---

## ✨ Features

- 🟢 **Core Orb Visualizer**: Reacts with CSS pulse rates representing *Idle*, *Listening*, *Thinking*, and *Streaming* statuses.
- 🎙️ **Speech to Text**: Native speech recognition built directly into the microphone button using the Web Speech API.
- 🧪 **Code Rendering & Copying**: Beautiful Markdown rendering with Marked.js and syntax-highlighted blocks with Prism.js, complete with one-click copy buttons.
- 🎨 **Neon Cyberpunk Aesthetic**: Harmony HSL custom palettes, glassmorphic panel controls, deep space canvas grids, and optimized visual micro-animations.
- 💾 **Session History**: Automatic local persistence via `localStorage` to keep your conversations safe between sessions.

---

## 🛠️ Deploying to GitHub Pages

Since **Agent Dhanush** is a purely static client-side web application, it deploys to GitHub Pages in seconds!

### Step 1: Initialize Git Local Repository
Open a terminal in the project directory (`C:\Users\dhanu\.gemini\antigravity\scratch\agent-dhanush`) and run:
```bash
git init
git add .
git commit -m "Initialize Agent Dhanush Next-Gen Cyberpunk Interface"
```

### Step 2: Create a Repository on GitHub
1. Go to your [GitHub Dashboard](https://github.com/new).
2. Create a new repository named `agent-dhanush`. Keep it **Public**.
3. Do **NOT** initialize it with a README, `.gitignore`, or license.

### Step 3: Link and Push
Link your local repository to GitHub and push your code:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/agent-dhanush.git
git push -u origin main
```
*(Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username).*

### Step 4: Enable GitHub Pages
1. Go to your repository settings on GitHub.
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
4. Under **Branch**, select `main` and `/ (root)`.
5. Click **Save**.

Your next-gen cyberpunk assistant will be live at `https://YOUR_GITHUB_USERNAME.github.io/agent-dhanush/` in less than a minute!
