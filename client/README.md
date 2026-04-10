# PX WebBuilder

PX WebBuilder is the dedicated, visually-driven website generation software part of the Reset Studio suite. Designed as a flexible, modular block editor, the platform empowers users to quickly build responsive, high-converting one-pagers visually and then instantly export them as standalone, dependency-free HTML packages.

## Universal Fluid Layout Engine (V2)

The most recent core upgrade (V2) integrates a completely fluid, state-driven layout engine across all blocks.

- **Dynamischer Leerraum:** Stufenlose Skalierung von `Padding Top` und `Padding Bottom` pro Block-Instanz.
- **Variable Block-Breiten:** Jeder Container kann flexibel in seiner `Max Width` zwischen 40% und 100% justiert werden.
- **Dynamische Raster:** Spezifische Spalten-Einstellungen per Arbitrary-Values (z.B. für das Layout-Verhältnis im SplitBlock).
- **Synchroner Export:** Alle im Editor via Sidebar festgelegten Slider-Werte werden zur Compile-Zeit direkt vom `htmlBuilder` als Inline-CSS Attribute geparst, weshalb das exportierte ZIP immer exakt dem Live-Editor Zustand entspricht.

## Tech Stack

### Frontend (Client)
- **Framework:** React 18 / TypeScript
- **Styling:** Tailwind CSS V4
- **State:** Zustand (zustand) für das Projekt und Block Management
- **Interaction:** `@dnd-kit` für das Drag-and-Drop Block-Ordering. `lucide-react` für UX-Icons.
- **Build Tool:** Vite

### Backend (Server)
- **Framework:** Express / Node.js
- **Exporter:** Custom WebBuilder HTML Compiler (`htmlBuilder.js`)
- **Archiving:** `archiver` zur on-the-fly Generierung der `.zip` Export-Pakete.
- **Asset Pipeline:** Multi-File Upload Handling via `multer`.

---

## Developer Scripts

In the `server` directory:
- `npm run dev`: Starts the express backend on port 3001.

In the `client` directory:
- `npm run dev`: Starts the Vite client on port 5173.

*PX WebBuilder is an internal sub-service of Reset Studio. All code is proprietary and developed by Pixelschickeria.*
