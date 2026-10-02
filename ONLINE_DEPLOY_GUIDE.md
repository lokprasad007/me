# 🚀 How to Put Your NEXUS Study Hub Online (100% Free)

Your website is now **100% web-ready**, optimized for mobile phones (iOS / Android), tablets, and desktop browsers with Mozilla's PDF.js cross-platform reader, clean web URLs, PWA capabilities, and pre-built hosting configurations.

Here are the **3 easiest ways** to publish it online for free:

---

## ⚡ Method 1: Netlify Drop (Easiest — 15 Seconds, Zero Setup)

This is the fastest method to get an instant live HTTPS website link without touching any terminal or signing up:

1. Open **[app.netlify.com/drop](https://app.netlify.com/drop)** in your web browser.
2. Open Windows File Explorer and navigate to **`D:\3`**.
3. **Drag and drop the entire `3` folder** directly onto the upload circle on the Netlify webpage.
4. Netlify will upload the files and instantly generate a live public URL (e.g., `https://vtu-study-nexus.netlify.app`).
5. Share the link with your classmates and access it on your phone or laptop anywhere in the world!

---

## 🐙 Method 2: GitHub Pages (Free Forever with Automatic CI/CD)

The repository already includes the automatic GitHub Pages workflow in `.github/workflows/deploy.yml`.

1. Open PowerShell in `D:\3`.
2. Initialize git and commit:
   ```powershell
   git init
   git add .
   git commit -m "Deploy NEXUS 3.0 Academic Hub"
   git branch -M main
   ```
3. Create a new repository on [GitHub](https://github.com/new) (e.g., named `vtu-studyhub`).
4. Link and push:
   ```powershell
   git remote add origin https://github.com/<your-username>/vtu-studyhub.git
   git push -u origin main
   ```
5. In your GitHub repository settings:
   - Go to **Settings** &rarr; **Pages**.
   - Under **Build and deployment > Source**, select **GitHub Actions**.
   - The included workflow will automatically build and publish your site at `https://<your-username>.github.io/vtu-studyhub/`!

---

## ▲ Method 3: Vercel (1-Command Deploy)

A pre-configured `vercel.json` with MIME types and caching headers is already created.

1. Open PowerShell in `D:\3`.
2. Run:
   ```powershell
   npx vercel --prod
   ```
3. Follow the prompts. In less than 1 minute, you will get an instant live production domain (e.g., `https://nexus-vtu-studyhub.vercel.app`).

---

## 📱 Features Working Online

- **Universal Mobile & Tablet PDF Reading**: Powered by Mozilla PDF.js canvas rendering, so students on iPhones, iPads, and Android devices can read all PDFs directly inside the webpage without forced download prompts.
- **Google Slides / Docs Viewer**: View `.ppt` PowerPoint presentations online directly inside the browser.
- **PWA (Progressive Web App)**: Tap **"Add to Home Screen"** on any smartphone to install the hub as a native app with offline support.
- **URL-Safe Asset Routing**: All files are mapped to clean URL paths in `/files/` to ensure 100% compatibility across Linux web servers, CDNs, and cloud hosts.
- **Web Share API**: One-click **Share** button in the navbar to send the link via WhatsApp, Telegram, or copy to clipboard.
