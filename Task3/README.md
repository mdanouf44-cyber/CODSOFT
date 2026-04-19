# 🖼️ Image Captioning AI — CodeSoft Task 3

A browser-based **Image Captioning** application that combines **Computer Vision** and **Natural Language Processing** to generate human-readable descriptions of images — running **100% locally in your browser** using Transformers.js.

---

## 🚀 How to Run

### Requirements
- **Node.js** installed (any version ≥ 14) — only needed to serve files locally
- A modern browser (Chrome, Edge, Firefox)
- Internet connection (first run only — to download the AI model)

### Step 1 — Start the local server

Open a terminal in the `Task3/` folder and run:

```bash
npx http-server . -p 3003 --cors -c-1 -o
```

This will:
- Serve the app at **http://127.0.0.1:3003**
- Disable caching (`-c-1`) so changes reload instantly
- Open the browser automatically (`-o`)

### Step 2 — Wait for the AI model to load

On first visit, the app will download the **ViT-GPT2 image captioning model** (~250 MB) from Hugging Face Hub. You'll see a **progress bar** at the top of the page.

> ⚡ After the first download, the model is **cached in your browser (IndexedDB)** — it loads instantly on every future visit, even offline.

### Step 3 — Generate a caption

1. Wait for the banner to show **"✅ Model ready"**
2. Drag-and-drop an image onto the upload area, or click **"click to browse"**, or click any image in the **Sample Gallery**
3. Click **Generate Caption**
4. The AI caption appears below — click **Copy** to copy it

### Alternative — Open directly (no server)

You can also open `index.html` directly from your file explorer by double-clicking it. However, a local server is **recommended** for the best experience (some browsers restrict module loading on `file://`).

---

## ✨ Features

| Feature | Details |
|---|---|
| 🧠 Runs in Browser | Model executes locally via ONNX/WASM — no server, no API key |
| 🔒 Privacy First | Images never leave your device |
| 🖱️ Drag & Drop | Drop images directly onto the upload area |
| 📁 File Upload | Click to browse — PNG, JPG, WEBP, GIF up to 10 MB |
| 🖼️ Sample Gallery | 6 pre-loaded sample images for instant testing |
| ⚡ Progress Bar | Live model download progress shown on first load |
| 📋 Copy Caption | One-click copy to clipboard |
| 💾 Model Caching | Model cached in IndexedDB — instant load after first visit |
| 📱 Fully Responsive | Works on mobile, tablet, and desktop |

---

## 🧠 How It Works

```
User Image
    │
    ▼
┌─────────────────────────────────────────┐
│   Vision Transformer (ViT-Base)         │  ← Encodes image into
│   Patch size 16 · 224×224 input         │     visual token embeddings
└─────────────────────────────────────────┘
    │  visual embeddings (197 tokens)
    ▼
┌─────────────────────────────────────────┐
│   GPT-2 Language Decoder                │  ← Cross-attends to visual
│   (Transformer + Cross-Attention)       │     tokens, generates caption
└─────────────────────────────────────────┘
    │
    ▼
"a dog is running through a field of grass"
```

**Transformers.js** converts the PyTorch model to **ONNX format** and runs it via **WebAssembly** right inside your browser — no GPU, no server.

---

## 📁 File Structure

```
Task3/
├── index.html   # App structure & layout
├── style.css    # Premium dark-mode design system
├── script.js    # AI inference logic using Transformers.js
├── proxy.js     # (legacy) CORS proxy — no longer needed
└── README.md    # This file
```

---

## 🛠️ Technologies

| Tech | Purpose |
|---|---|
| **Vanilla HTML / CSS / JavaScript** | Zero framework dependencies |
| **Transformers.js** (`@huggingface/transformers`) | Runs ONNX models in the browser |
| **Xenova/vit-gpt2-image-captioning** | ViT encoder + GPT-2 decoder model |
| **ONNX Runtime Web** | WebAssembly inference engine |
| **Google Fonts** | Space Grotesk & Syne typography |
| **Unsplash** | Sample image CDN |

---

## ⚙️ Model Info

| Property | Value |
|---|---|
| Model ID | `Xenova/vit-gpt2-image-captioning` |
| Architecture | ViT-Base/16 encoder + GPT-2 decoder |
| Task | `image-to-text` |
| Format | ONNX (quantized for browser) |
| Download size | ~250 MB (first run only) |
| Inference | WebAssembly / local CPU |

---

## 📄 License

Built for **CodeSoft** internship — Task 3.
