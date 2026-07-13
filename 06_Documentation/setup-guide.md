# E-Wiz Kid Abacus Adventure – Setup Guide

This guide provides instructions for deploying and running the application locally. As this is a 100% frontend static web application, the setup process is incredibly straightforward.

## Requirements
- A modern web browser (Chrome, Edge, Firefox, Safari).
- A local web server (to avoid CORS policies when loading the `04_GameData/` JSON files).

## Installation & Running

### Option 1: Node.js (Recommended)
If you have Node.js installed, the simplest method is using `serve`:

1. Open your terminal.
2. Navigate to the project root directory (`E-WizKid_AbacusAdventure/`).
3. Run the following command:
   ```bash
   npx serve .
   ```
4. Open your browser and navigate to the local address provided (typically `http://localhost:3000`).
5. Click on `01_Website/` to launch the application.

### Option 2: VS Code Live Server
If you are using Visual Studio Code:
1. Open the project root folder in VS Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Right-click on `01_Website/index.html`.
4. Select **"Open with Live Server"**.

### Option 3: Python HTTP Server
If you have Python installed:
1. Open your terminal.
2. Navigate to the project root directory.
3. Run:
   ```bash
   python -m http.server 8000
   ```
4. Open `http://localhost:8000/01_Website/index.html` in your browser.

## Deployment to Production
Because the application contains no backend infrastructure, you can deploy it directly to any static hosting provider.
We recommend platforms like **Vercel**, **Netlify**, or **GitHub Pages**. Simply set the publish directory to the project root and ensure it serves the `01_Website/index.html` as the entry point.

---
*End of Guide*
