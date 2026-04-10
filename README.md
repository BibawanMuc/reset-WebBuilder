# 🧱 PX WebBuilder

Der **PX WebBuilder** ist ein maßgeschneiderter, modularer Landingpage- und Onepager-Baukasten. Er ermöglicht es, moderne, hochperformante Websiten aus verschiedenen UI-Bausteinen per Drag & Drop zusammenzuklicken, visuell anzupassen und am Ende als rein statisches, blitzschnelles HTML/CSS-Archiv (Vanilla) zu exportieren. 

Ohne Datenbank-Overhead, ohne monatliche Abo-Kosten, zu 100% in der eigenen Kontrolle.

---

## ✨ Kern-Features

- 🖱️ **Pures Drag & Drop:** Intuitive Bedienung durch eine visuelle Seitenübersicht (Canvas). Blöcke aus der Sidebar ziehen und beliebig per Grip-Icon sortieren/verschieben.
- 🎨 **Globales Theming:** Eigene Markenfarben (Primary & Secondary), benutzerdefinierte Hintergrundbilder & Verläufe, sowie nahtlose Integration moderner Google Fonts (z.B. *Inter*, *Outfit*).
- 🧩 **Modulare Bausteine (Blocks):** 
  - *Hero Header & Navbar* (Above the Fold Eindruck)
  - *Features Grid & Avatar Grid* (Team- und USP-Präsentation)
  - *Split & Text* (Inhalte und tiefere Erklärungen)
  - *Carousel Slider* (für Swipe-Galerien mit CSS Snapping)
  - *Video & Image* (für multimediale Kampagnen inkl. Autoplay)
- 💾 **Dateibasierte Persistenz:** Kein Datenbank-Setup nötig. Projekte speichern sich nativ als `.json` im Dateisystem. Bilder und Videos werden per Multer direkt lokal hinterlegt.
- 🚀 **Export-Engine:** Ein Klick und das Backend rendert aus dem JSON-Zustand eine fertige, responsiv designte und Tailwind-inkludierte, abrufbare `.zip`-Datei zum Deployment auf jedem beliebigen Webserver.

---

## 🏗️ Architektur & Tech-Stack

Das Projekt ist in einem Monorepo-Ansatz in Frontend- und Backend aufgeteilt:

**Frontend (`/client`)**
* **React 18 & Vite:** Für rasante Entwicklungszeiten und ein reibungsloses Live-Previewing im Canvas.
* **Tailwind CSS:** Steuert das gesamte visuelle Korsett und globales Styling. 
* **dnd-kit:** Handhabt sowohl das Droppen aus der Sidebar als auch die aufwendige Vertikal-Sortierung der Bausteine.
* **Zustand:** Speichert das aktuelle Editor-Projekt im Global State.

**Backend (`/server`)**
* **Node.js & Express:** Startet auf Port 3001 und lauscht auf API-Anfragen.
* **Multer:** Kümmert sich um den perfekten Media-Upload auf den lokalen Server.
* **Export Renderer:** Das Herzstück (`htmlBuilder.js`). Nimmt React komplett aus der Rechnung und extrahiert puristisches HTML & CSS (Static Site Generation Ansatz) zur optimalen SEO- und Ladezeit.

*(Für mehr strategisches Hintergrundwissen siehe: `Onepager_Architektur_Leitfaden.md` im Projekt)*

---

## 🚀 Erste Schritte (Lokal ausführen)

Voraussetzungen: Node.js (v18+)

**1. Abhängigkeiten installieren:**
\`\`\`bash
# Im Hauptordner (installiert falls eingerichtet concurrently o.ä.)
npm install

# Im Ordner /server
cd server
npm install

# Im Ordner /client
cd ../client
npm install
\`\`\`

**2. App starten:**
Wenn ein Root-Skript existiert (z.B. über npm run dev), nutze dies. 
Alternativ startest du Frontend und Backend jeweils in einem eigenen Terminal:

\`\`\`bash
# Terminal 1 (Backend)
cd server
node server.js
# Backend läuft auf http://localhost:3001

# Terminal 2 (Frontend)
cd client
npm run dev
# Frontend erreichbar meist unter http://localhost:5173
\`\`\`

**3. Nutzung:**
1. Erstelle ein neues Projekt im Dashboard.
2. Ziehe Blöcke wie "Hero Header" auf die weiße Fläche.
3. Editiere den Text und wechsle rechts im Inspector die Bilder aus.
4. Speichere das Projekt oben rechts beim Beenden!

---

## 💡 Markdown-Formatierung (Rich Text)
Im Editor kannst du auf rudimentäre Markdown-Formatierung innerhalb der Textfelder zugreifen, ohne tiefen Code schreiben zu müssen:

* \`**Fett**\` generiert fetten Text.
* \`*Kursiv*\` generiert kursiven Text.
* \`++Primary++\` färbt den Text in deiner im Theme aktivierten Hauptfarbe.
* \`--Secondary--\` färbt den Text in der entsprechenden Zweitfarbe.

*(Beispiel: \`Wir bauen ++**geile Onepager**++.\` = Text wird fett und in der Akzentfarbe dargestellt)*
