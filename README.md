<div align="center">
  <img src="public/icons/icon128.png" alt="FixTheFlow Logo" width="128"/>

  # FixTheFlow
  **The privacy-first, beautifully designed screen recording extension.**

  [![Svelte](https://img.shields.io/badge/Svelte-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![CRXJS](https://img.shields.io/badge/CRXJS-1C1C1E?style=for-the-badge)](https://crxjs.dev/vite-plugin)

</div>

---

## 🌟 Overview

**FixTheFlow** is a modern Google Chrome extension built to capture frictionless screen recordings paired with microphone audio, without ever compromising user privacy. 

Before hitting record, FixTheFlow's **Setup Mode** allows you to interactively blur and encrypt sensitive elements (like passwords, emails, and personal data) directly in the DOM. The resulting `.webm` video is processed 100% locally on your machine—your data never touches a cloud server unless you choose to share it.

Boasting a meticulous, Apple-inspired design system, FixTheFlow provides a floating frosted-glass toolbar, crisp typography, and an unobtrusive user experience.

---

## ✨ Features

- 🔒 **Client-Side Data Masking:** Interactively click on any DOM element (inputs, text, images) to blur it securely before the recording begins.
- 🎙️ **Microphone Support:** Seamlessly capture tab audio and microphone voiceovers via Chrome's Offscreen Document API.
- 🎨 **Apple Design System:** A pristine, photography-first UI featuring frosted glass `backdrop-filter` effects, crisp `SF Pro` typography, and satisfying micro-interactions.
- 🛠️ **Floating Toolbar:** A draggable, unobtrusive control panel that stays out of your way while you demonstrate workflows.
- 💾 **Local Processing:** No cloud uploads, no processing servers. Videos are generated locally as `.webm` files for immediate, secure download.

---

## 💻 Tech Stack

- **Framework:** [Svelte 5](https://svelte.dev/blog/svelte-5-is-alive) for highly reactive, compiled UI components.
- **Language:** [TypeScript](https://www.typescriptlang.org/) for robust, type-safe Chrome API interactions.
- **Build Tool:** [Vite](https://vitejs.dev/) & [CRXJS](https://crxjs.dev/vite-plugin) for lightning-fast HMR and modern extension bundling.
- **Icons:** [Lucide Svelte](https://lucide.dev/) for clean, consistent iconography.

---

## 🚀 Installation (Development)

Since this extension is in active development, you will need to load it into Chrome as an **Unpacked Extension**.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Anxthu/FixTheFlow.git
   cd FixTheFlow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```
   *Note: For hot-module replacement (HMR) during active development, you can use `npm run dev`.*

4. **Load into Chrome:**
   - Open Google Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** (toggle in the top right corner).
   - Click **Load unpacked**.
   - Select the `dist` folder generated inside the `FixTheFlow` directory.

---

## 📖 How to Use

1. **Launch Setup:** Click the FixTheFlow extension icon in your Chrome toolbar.
2. **Configure:** Toggle microphone access from the Pre-Setup Modal.
3. **Mask Data:** During the "Setup" phase, click on any sensitive information on the web page. The extension will automatically apply a secure blur.
4. **Record:** Click the red **Start Recording** button in the floating Setup Bar.
5. **Control:** Use the draggable frosted-glass toolbar to toggle drawing modes or stop the recording.
6. **Download:** Once stopped, a Friction Report overlay will appear, allowing you to instantly download your secure `.webm` file.

---

## 🎨 Design Philosophy

FixTheFlow strictly adheres to a premium, Apple-inspired aesthetic (`DESIGN.md`):
- **Typography:** Relies heavily on the `SF Pro Display` and `SF Pro Text` rhythm with negative letter-spacing for a tight, professional cadence.
- **Color Palette:** Pure white canvases (`#ffffff`), off-white parchments (`#f5f5f7`), and stark contrast inks (`#1d1d1f`).
- **Interactive Elements:** Universal "Action Blue" (`#0066cc`) for primary actions, with destructive or recording actions utilizing a stark Red (`#ff3b30`).
- **Elevation:** Flat design with hairline borders (`#e0e0e0`) and heavy reliance on CSS `backdrop-filter: blur(20px)` for floating elements.

---

<div align="center">
  <i>Built with ❤️ for frictionless, secure workflows.</i>
</div>
