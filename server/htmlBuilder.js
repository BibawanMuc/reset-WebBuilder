export function buildHtmlDocument(project) {
  const fontLink = getFontLink(project.config?.font);
  const fontFamily = getFontFamily(project.config?.font);
  const theme = project.config?.theme || {};

  const primaryColor = theme.primaryColor || '#000000';
  const secondaryColor = theme.secondaryColor || '#a855f7';
  const textColor = theme.textColor || '#111827';
  const radius = theme.borderRadius || '1.5rem';

  // Basis Farbe/Verlauf
  let bgStyle = `background-color: ${theme.backgroundColor || '#f9fafb'};`;
  if (theme.backgroundColor2 && theme.backgroundColor2 !== theme.backgroundColor) {
    bgStyle = `background: linear-gradient(135deg, ${theme.backgroundColor || '#ffffff'}, ${theme.backgroundColor2});`;
  }

  // Zusätzlicher Hintergrundbild-Layer über Pseudo-Element
  let bgImageStyle = '';
  if (theme.backgroundImage) {
    const bgUrl = processUrl(theme.backgroundImage, true);
    const bgSize = theme.backgroundSize === 'contain' ? 'contain' : (theme.backgroundSize === 'repeat' ? 'auto' : 'cover');
    const bgRepeat = theme.backgroundSize === 'repeat' ? 'repeat' : 'no-repeat';
    const bgOpacity = theme.backgroundOpacity ?? 1;
    bgImageStyle = `
      body::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        background-image: url('${bgUrl}');
        background-size: ${bgSize};
        background-repeat: ${bgRepeat};
        background-position: center;
        opacity: ${bgOpacity};
      }
    `;
  }

  // Generiere den HTML Header inkl. Tailwind CDN
  let html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(project.name)}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: {
              sans: [${fontFamily}],
            },
            colors: {
              primary: 'var(--theme-primary)',
              secondary: 'var(--theme-secondary)',
            },
            borderRadius: {
              'theme': 'var(--theme-radius)',
            }
          }
        }
      }
    </script>
    ${fontLink}
    <style>
      :root {
        --theme-primary: ${primaryColor};
        --theme-secondary: ${secondaryColor};
        --theme-radius: ${radius};
      }
      body { 
        font-family: ${fontFamily}; 
        color: ${textColor};
        ${bgStyle}
      }
      ${bgImageStyle}
      ${theme.enableAnimations ? `
      .anim-hidden { opacity: 0; transform: translateY(40px); }
      .anim-fade-up { opacity: 1; transform: translateY(0); transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
      ` : ''}
      ${theme.enableDarkMode ? `
      html.dark body { background: #111827 !important; color: #f9fafb !important; }
      html.dark .bg-white { background-color: #1f2937 !important; border-color: #374151 !important; color: #f9fafb !important; }
      html.dark .bg-gray-50 { background-color: #111827 !important; }
      html.dark .text-gray-900 { color: #f9fafb !important; }
      html.dark .text-gray-800 { color: #f3f4f6 !important; }
      html.dark .text-gray-700 { color: #e5e7eb !important; }
      html.dark .text-gray-600, html.dark .text-gray-500 { color: #9ca3af !important; }
      html.dark .border-gray-100, html.dark .border-gray-200, html.dark .border-gray-300 { border-color: #374151 !important; }
      ` : ''}
    </style>
    ${theme.enableDarkMode ? `
    <script>
      if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    </script>
    ` : ''}
</head>
<body class="overflow-x-hidden relative">
`;

  // Iteriere über Blöcke
  const page = project.pages?.[0];
  let blocksHtml = '';
  if (page && page.blocks && page.blocks.length > 0) {
    blocksHtml = page.blocks.map(b => {
      const bHtml = renderBlockToHtml(b, project);
      return theme.enableAnimations ? `<div class="anim-wrapper anim-hidden">${bHtml}</div>` : bHtml;
    }).join('\n');
  } else {
    blocksHtml = `<div class="p-10 text-center"><h1 class="text-3xl">Leeres Projekt</h1></div>`;
  }

  let scrollToTopHtml = '';
  if (theme.showScrollToTop) {
    scrollToTopHtml = `
      <button onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" class="fixed bottom-8 right-8 w-12 h-12 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:opacity-90 transition-opacity z-50 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </button>
    `;
  }

  const impressumTextHtml = parseRichText(project.config?.impressumText ?? `**Angaben gem&auml;&szlig; &sect; 5 TMG**\n[Firma / Vorname Name]\n[Stra&szlig;e Hausnummer]\n[PLZ Ort]\n\n**Kontakt**\nTelefon: [Telefonnummer]\nE-Mail: [E-Mail-Adresse]\n\n**Umsatzsteuer-ID**\nUmsatzsteuer-Identifikationsnummer gem&auml;&szlig; &sect; 27 a Umsatzsteuergesetz:\n[DE123456789]`);
  const privacyTextHtml = parseRichText(project.config?.privacyText ?? `**1. Datenschutz auf einen Blick**\nDie folgenden Hinweise geben einen einfachen &Uuml;berblick dar&uuml;ber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.\n\n**Verantwortliche Stelle**\n[Firma / Vorname Name]\n[Stra&szlig;e Hausnummer]\n[PLZ Ort]\nE-Mail: [E-Mail-Adresse]\n\n**2. Datenerfassung auf dieser Website**\nIhre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Daten, die beim Besuch der Website anfallen (z.B. IP-Adressen), werden zur Fehlerbehebung oder Analyse auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO verarbeitet.`);

  let footerHtml = `
    <!-- Footer Links -->
    <footer class="w-full max-w-7xl mx-auto py-8 mt-4 border-t border-gray-200 flex justify-center gap-6 text-sm text-gray-500 relative z-10">
      <button onclick="document.getElementById('modal-impressum').classList.remove('hidden'); document.body.style.overflow = 'hidden';" class="hover:underline hover:text-gray-900 cursor-pointer">Impressum</button>
      <button onclick="document.getElementById('modal-privacy').classList.remove('hidden'); document.body.style.overflow = 'hidden';" class="hover:underline hover:text-gray-900 cursor-pointer">Datenschutz</button>
    </footer>

    <!-- Overlay Modal Impressum -->
    <div id="modal-impressum" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm hidden" onclick="this.classList.add('hidden'); document.body.style.overflow = 'auto';">
      <div class="bg-white text-gray-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onclick="event.stopPropagation()" style="font-family: ${fontFamily};">
        <div class="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 class="text-xl font-bold">Impressum</h2>
          <button onclick="document.getElementById('modal-impressum').classList.add('hidden'); document.body.style.overflow = 'auto';" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="p-8 overflow-y-auto custom-scrollbar">
          <div class="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">${impressumTextHtml}</div>
        </div>
      </div>
    </div>

    <!-- Overlay Modal Datenschutz -->
    <div id="modal-privacy" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm hidden" onclick="this.classList.add('hidden'); document.body.style.overflow = 'auto';">
      <div class="bg-white text-gray-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onclick="event.stopPropagation()" style="font-family: ${fontFamily};">
        <div class="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 class="text-xl font-bold">Datenschutz</h2>
          <button onclick="document.getElementById('modal-privacy').classList.add('hidden'); document.body.style.overflow = 'auto';" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="p-8 overflow-y-auto custom-scrollbar">
          <div class="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">${privacyTextHtml}</div>
        </div>
      </div>
    </div>
  `;

  let darkModeToggleHtml = '';
  if (theme.enableDarkMode) {
    darkModeToggleHtml = `
      <button id="theme-toggle" type="button" class="fixed top-6 right-6 z-[100] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5 shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors">
        <svg id="theme-toggle-dark-icon" class="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
        <svg id="theme-toggle-light-icon" class="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
      </button>
      <script>
        var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
        var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            themeToggleLightIcon.classList.remove('hidden');
        } else {
            themeToggleDarkIcon.classList.remove('hidden');
        }

        var themeToggleBtn = document.getElementById('theme-toggle');
        themeToggleBtn.addEventListener('click', function() {
            themeToggleDarkIcon.classList.toggle('hidden');
            themeToggleLightIcon.classList.toggle('hidden');

            if (localStorage.getItem('theme')) {
                if (localStorage.getItem('theme') === 'light') {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                }
            } else {
                if (document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                } else {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                }
            }
        });
      </script>
    `;
  }

  let animationScript = '';
  if (theme.enableAnimations) {
    animationScript = `
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.remove('anim-hidden');
              entry.target.classList.add('anim-fade-up');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.anim-wrapper').forEach(el => observer.observe(el));
      });
    </script>
    `;
  }

  html += `${blocksHtml}
${darkModeToggleHtml}
${footerHtml}
${scrollToTopHtml}
${animationScript}
</body>
</html>`;

  return html;
}

// Rewrites http://localhost:3001/uploads/... to ./assets/... for exports
function processUrl(url, isExport = true) {
  if (!url) return '';
  if (isExport && url.includes('/uploads/')) {
    const filename = url.split('/').pop();
    return `./assets/${filename}`;
  }
  return escapeStyleUrl(url);
}

// Hilfsfunktionen für Font-Mapping
function getFontLink(font) {
  switch (font) {
    case 'Merriweather': return `<link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap" rel="stylesheet">`;
    case 'Outfit': return `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">`;
    default: return `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">`; // Inter
  }
}

function getFontFamily(font) {
  switch (font) {
    case 'Merriweather': return `"Merriweather", "serif"`;
    case 'Outfit': return `"Outfit", "sans-serif"`;
    case 'Roboto': return `"Roboto", "sans-serif"`;
    case 'Playfair Display': return `"Playfair Display", "serif"`;
    default: return `"Inter", "sans-serif"`;
  }
}

// Entflechtung der Blöcke
function renderBlockToHtml(block, project) {
  const props = block.props || {};
  const pt = props.paddingTop !== undefined ? props.paddingTop : 4;
  const pb = props.paddingBottom !== undefined ? props.paddingBottom : 4;
  const mw = props.maxWidth !== undefined ? props.maxWidth : 100;
  const styleObj = (props.bgType === 'custom' && props.bgColor) ? `background-color: ${escapeHtml(props.bgColor)};` : '';
  const inlineStyle = `style="${styleObj} padding-top: ${pt}rem; padding-bottom: ${pb}rem; max-width: ${mw}%;"`;
  const containerStyle = `style="padding-top: ${pt}rem; padding-bottom: ${pb}rem; max-width: ${mw}vw; margin: 0 auto;"`;


  switch (block.type) {
    case 'NavbarBlock': {
      const parsedLinks = props.links ? props.links.split(',').map(l => l.trim()).filter(l => l.length > 0) : ["Home", "Features", "Preise", "Kontakt"];
      const logoText = escapeHtml(props.logoText || project.name || "Mein Projekt");
      const logoImg = project.config?.logo ? processUrl(project.config.logo, true) : null;
      const linksHtml = parsedLinks.map(l => `<a href="#${escapeHtml(l)}" class="hover:text-primary cursor-pointer transition-colors">${escapeHtml(l)}</a>`).join('\n');
      
      const logoHtml = logoImg 
        ? `<img src="${logoImg}" alt="Logo" class="h-8 max-w-[120px] object-contain" />` 
        : `<div class="w-8 h-8 rounded bg-gray-200 flex items-center justify-center font-bold text-gray-500">L</div>`;

      const btnHtml = props.hideButton ? "" : `
        <div class="hidden md:block">
          <button class="px-5 py-2.5 bg-primary text-white rounded-theme text-sm font-medium hover:opacity-90 transition-opacity pointer-events-none">Get Started</button>
        </div>
      `;

      const customBg = props.bgType === 'custom' && props.bgColor ? `style="background-color: ${escapeHtml(props.bgColor)};"` : '';
      const bgClass = props.bgType === 'transparent' ? 'bg-transparent' : (props.bgType === 'custom' ? '' : 'bg-white');
      const borderClass = props.noShadow || props.bgType === 'transparent' ? 'border-none shadow-none' : 'border-b border-gray-100 shadow-sm';
      const decoHtml = props.showDecoration ? `<div class="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-secondary blur-[50px] opacity-20 pointer-events-none z-0"></div>` : "";
      const anchorAttr = props.anchorId ? `id="${escapeHtml(props.anchorId)}"` : '';

      const mobileNavId = props.anchorId ? `mobile-menu-${escapeHtml(props.anchorId)}` : `mobile-menu-default`;
      
      const mobileMenuHtml = `
        <div class="md:hidden flex flex-col gap-1.5 cursor-pointer relative z-10 p-2 -mr-2" onclick="document.getElementById('${mobileNavId}').classList.remove('hidden'); document.body.style.overflow='hidden';">
          <div class="w-6 h-0.5 bg-gray-600 rounded pointer-events-none"></div>
          <div class="w-6 h-0.5 bg-gray-600 rounded pointer-events-none"></div>
          <div class="w-6 h-0.5 bg-gray-600 rounded pointer-events-none"></div>
        </div>

        <div id="${mobileNavId}" class="hidden fixed inset-0 bg-white z-[200] flex flex-col pt-24 px-8 shadow-xl md:hidden">
          <button onclick="document.getElementById('${mobileNavId}').classList.add('hidden'); document.body.style.overflow='auto';" class="absolute top-8 right-8 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div class="flex flex-col gap-6 text-xl font-medium text-gray-800">
            ${parsedLinks.map(l => `<a href="#${escapeHtml(l)}" onclick="document.getElementById('${mobileNavId}').classList.add('hidden'); document.body.style.overflow='auto';" class="block border-b border-gray-100 pb-4">${escapeHtml(l)}</a>`).join('\n')}
          </div>
          ${!props.hideButton ? `<button class="mt-8 px-5 py-3 w-full bg-primary text-white rounded-theme text-lg font-medium pointer-events-none">Get Started</button>` : ''}
        </div>
      `;

      return `
        <!-- NavbarBlock -->
        <div ${anchorAttr} class="w-full relative overflow-hidden flex items-center px-8  mb-4 rounded-theme ${bgClass} ${borderClass}"  ${inlineStyle}>
          ${decoHtml}
          <div class="flex items-center gap-3 relative z-10 mr-auto">
            ${logoHtml}
            <span class="font-bold text-xl tracking-tight text-gray-900">${logoText}</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 relative z-10 mr-8">
            ${linksHtml}
          </nav>
          ${btnHtml}
          ${mobileMenuHtml}
        </div>
      `;
    }

    case 'HeroSection': {
      const headline = parseRichText(props.headline || "Dein unglaublicher Slogan steht *hier*.");
      const subline = parseRichText(props.subline || "Unterstützender Text, der Besuchern ++genau sagt++, was du anbietest und warum sie hier klicken sollten.");
      const buttonText = escapeHtml(props.buttonText || "Mehr erfahren");
      const buttonHtml = props.hideButton ? "" : `<button class="px-8 py-4 bg-primary text-white rounded-theme font-medium shadow-lg hover:opacity-90 transition-opacity">${buttonText}</button>`;

      const customBg = props.bgType === 'custom' && props.bgColor ? `style="background-color: ${escapeHtml(props.bgColor)};"` : '';
      const bgClass = props.bgType === 'transparent' ? 'bg-transparent' : (props.bgType === 'custom' ? '' : 'bg-white');
      const borderClass = props.noShadow || props.bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';
      const decoHtml = (props.showDecoration || props.showDecoration === undefined) ? `<div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-secondary blur-[80px] opacity-20 pointer-events-none z-0"></div>` : "";
      const anchorAttr = props.anchorId ? `id="${escapeHtml(props.anchorId)}"` : '';

      return `
        <!-- HeroSection -->
        <div ${anchorAttr} class="w-full  mx-auto relative overflow-hidden rounded-theme my-4 ${bgClass} ${borderClass}"  ${inlineStyle}>
          ${decoHtml}
          <div class="relative z-10 px-8 py-20 md:px-12 md:py-32 flex flex-col items-start justify-center">
            <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 max-w-3xl leading-tight">${headline}</h1>
            <p class="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed">${subline}</p>
            ${buttonHtml}
          </div>
        </div>
      `;
    }

    case 'TextBlock': {
      const title = props.title ? parseRichText(props.title) : "";
      const content = parseRichText(props.content || "Hier ist Platz für deinen Fließtext. Beschreibe detailliert einen Aspekt deines Unternehmens, erkläre ein Produkt oder teile einfach Informationen mit deinen Besuchern. Dieser Block ++passt sich++ an die Textmenge an.");
      const align = props.alignment || "left";
      
      const titleHtml = title ? `<h2 class="text-3xl font-bold text-gray-900 mb-6">${title}</h2>` : "";

      const customBg = props.bgType === 'custom' && props.bgColor ? `style="background-color: ${escapeHtml(props.bgColor)};"` : '';
      const bgClass = props.bgType === 'transparent' ? 'bg-transparent' : (props.bgType === 'custom' ? '' : '');
      const borderClass = props.noShadow || props.bgType === 'transparent' ? 'border-none shadow-none' : (props.bgType === 'custom' ? 'border border-gray-100 shadow-sm' : '');
      const paddingClass = props.bgType === 'custom' || props.bgType === 'white' ? 'p-8 md:p-12' : '';
      const decoHtml = props.showDecoration ? `<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary blur-[100px] opacity-15 pointer-events-none z-0"></div>` : "";
      const anchorAttr = props.anchorId ? `id="${escapeHtml(props.anchorId)}"` : '';

      return `
        <!-- TextBlock -->
        <div ${anchorAttr} class="w-full  px-8 md:px-12 my-2 text-${align}  mx-auto relative overflow-hidden rounded-theme ${bgClass} ${borderClass} ${paddingClass}"  ${inlineStyle}>
          ${decoHtml}
          <div class="relative z-10">
            ${titleHtml}
            <div class="prose max-w-none text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">${content}</div>
          </div>
        </div>
      `;
    }

    case 'ImageBlock': {
      if (!props.url) return `<div class="w-full py-8 px-4 flex flex-col items-center"><div class="w-full max-w-4xl aspect-[16/9] bg-gray-100 rounded-theme border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><p class="font-medium">Kein Bild ausgew&auml;hlt</p><p class="text-sm mt-1">Klicke diesen Block an, um in der Sidebar ein Bild zu hinterlegen.</p></div></div>`;
      
      const url = processUrl(props.url, true);
      const alt = escapeHtml(props.alt || "User Logo");
      const captionHtml = props.caption ? `<figcaption class="mt-4 text-center text-sm text-gray-500">${escapeHtml(props.caption)}</figcaption>` : "";

      return `
        <!-- ImageBlock -->
        <div class="w-full px-4 flex flex-col items-center mx-auto" ${inlineStyle}>
          <figure class="w-full">
            <img src="${url}" alt="${alt}" class="w-full h-auto rounded-theme shadow-xl object-cover" />
            ${captionHtml}
          </figure>
        </div>
      `;
    }

    case 'ButtonBlock': {
      const label = escapeHtml(props.label || "Klick mich");
      const link = escapeStyleUrl(props.url || "#");
      const align = props.alignment || "center";
      const variant = props.variant || "primary";

      const alignClass = align === 'center' ? 'center' : align === 'right' ? 'end' : 'start';
      let variantClass = "border-2 border-gray-200 text-gray-900 hover:border-primary";
      if (variant === 'primary') variantClass = "bg-primary text-white hover:opacity-90";
      if (variant === 'secondary') variantClass = "bg-secondary text-white hover:opacity-90";

      const targetAttr = !link.startsWith('#') && link !== '#' ? 'target="_blank" rel="noopener noreferrer"' : '';

      return `
        <!-- ButtonBlock -->
        <div class="w-full  px-4 flex justify-${alignClass}  mx-auto" ${inlineStyle}>
          <a href="${link}" ${targetAttr} class="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-theme transition-all shadow-sm hover:shadow-md ${variantClass}">
            ${label}
          </a>
        </div>
      `;
    }

    case 'SplitBlock': {
      const imageLeft = props.imageLeft !== false;
      const title = parseRichText(props.title || "Eine ++starke Aussage++ für dein Produkt.");
      const text = parseRichText(props.text || "Nutze diesen Text, um den Wert deines Bildes auf der anderen Seite hervorzuheben. Ein Split-Layout eignet sich perfekt, um **komplexe Informationen** in leicht verdauliche, visuelle Happen zu verpacken.");
      const btn = escapeHtml(props.buttonLabel || "");
      const imageWidth = props.imageWidth !== undefined ? props.imageWidth : 50;
      
      const btnHtml = btn ? `<div><button class="px-6 py-3 bg-white border-2 border-primary text-primary rounded-theme font-bold hover:bg-primary hover:text-white transition-colors">${btn}</button></div>` : "";
      
      const imgHtml = props.imageUrl 
        ? `<div class="w-full h-full min-h-[300px] flex items-center justify-center relative z-10"><img src="${processUrl(props.imageUrl, true)}" class="w-full h-auto object-cover rounded-theme shadow-xl" /></div>`
        : `<div class="w-full h-full min-h-[300px] bg-gray-100 rounded-theme border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 relative z-10"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><p class="font-medium text-center px-4">Bild in der Sidebar erg&auml;nzen</p></div>`;
      
      const customBg = props.bgType === 'custom' && props.bgColor ? `style="background-color: ${escapeHtml(props.bgColor)};"` : '';
      const bgClassGrid = props.bgType === 'transparent' ? 'bg-transparent' : (props.bgType === 'custom' ? '' : '');
      const borderClassGrid = props.noShadow || props.bgType === 'transparent' ? 'border-none shadow-none' : (props.bgType === 'custom' ? 'border border-gray-100 shadow-sm' : '');
      const paddingClass = props.bgType === 'custom' ? 'p-8 md:p-12' : '';
      
      const decoPositionClass = imageLeft ? "right-0 translate-x-1/3" : "left-0 -translate-x-1/3";
      const decoHtml = props.showDecoration ? `<div class="absolute top-1/2 ${decoPositionClass} -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-secondary blur-[120px] opacity-15 pointer-events-none z-0"></div>` : "";
      
      const txtHtml = `<div class="flex flex-col justify-center h-full px-4 py-8 md:p-12 pl-0 pr-0 relative z-10"><h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">${title}</h2><p class="text-lg text-gray-600 mb-8 leading-relaxed">${text}</p>${btnHtml}</div>`;
      const anchorAttr = props.anchorId ? `id="${escapeHtml(props.anchorId)}"` : '';

      return `
        <!-- SplitBlock -->
        <div ${anchorAttr} class="w-full overflow-hidden mx-auto relative" ${inlineStyle}>
          ${decoHtml}
          <div class="grid grid-cols-1 ${imageLeft ? 'lg:grid-cols-[var(--split-img-w)_1fr]' : 'lg:grid-cols-[1fr_var(--split-img-w)]'} gap-8 md:gap-16 items-center rounded-theme relative z-10 ${bgClassGrid} ${borderClassGrid} ${paddingClass}" style="${customBg ? customBg.replace('style="', '').replace('"', '') : ''} --split-img-w: ${imageWidth}%;">
            ${imageLeft ? imgHtml + txtHtml : txtHtml + imgHtml}
          </div>
        </div>
      `;
    }

    case 'FeaturesGridBlock': {
      const colStr = props.columns || '3';
      const colClass = colStr === '2' ? 'md:grid-cols-2' : colStr === '4' ? 'md:grid-cols-4' : 'md:grid-cols-3';
      
      const customBg = props.bgType === 'custom' && props.bgColor ? `style="background-color: ${escapeHtml(props.bgColor)};"` : '';
      const bgClassGrid = props.bgType === 'transparent' ? 'bg-transparent' : (props.bgType === 'custom' ? '' : 'bg-white');
      const borderClassGrid = props.noShadow || props.bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';

      const getIconSvg = (name) => {
        switch (name) {
          case 'zap': return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
          case 'shield': return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
          case 'heart': return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
          case 'lightbulb': return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`;
          case 'box': return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
          default: return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
        }
      };

      let gridContent = "";
      for (let i = 1; i <= parseInt(colStr); i++) {
        const featData = props[`f${i}`] || {};
        const featTitle = parseRichText(featData.title || `Feature ${i}`);
        const featText = parseRichText(featData.text || 'Beschreibung');
        const iconSvg = getIconSvg(featData.icon || 'star');

        gridContent += `
          <div class="flex flex-col items-start gap-4 p-6 rounded-theme hover:shadow-lg transition-shadow ${bgClassGrid} ${borderClassGrid}" ${customBg}>
            <div class="w-12 h-12 bg-primary text-white rounded-theme flex items-center justify-center shadow-md select-none font-bold">
              ${iconSvg}
            </div>
            <h3 class="text-xl font-bold text-gray-900">${featTitle}</h3>
            <p class="text-gray-600 leading-relaxed text-sm md:text-base">${featText}</p>
          </div>
        `;
      }

      const decoHtml = props.showDecoration ? `<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-secondary blur-[120px] opacity-10 pointer-events-none z-0"></div>` : "";
      const anchorAttr = props.anchorId ? `id="${escapeHtml(props.anchorId)}"` : '';

      return `
        <!-- FeaturesGridBlock -->
        <div ${anchorAttr} class="w-full  px-6  mx-auto relative overflow-hidden" ${inlineStyle}>
          ${decoHtml}
          <div class="grid grid-cols-1 ${colClass} gap-x-8 gap-y-12 relative z-10">
            ${gridContent}
          </div>
        </div>
      `;
    }
    case 'VideoBlock': {
      const title = props.title ? parseRichText(props.title) : "";
      const text = props.text ? parseRichText(props.text) : "";
      const url = props.url ? processUrl(props.url, true) : "";
      const autoPlayStr = props.autoPlay !== false ? "autoplay muted loop" : "";
      
      const titleHtml = title ? `<h2 class="text-3xl font-bold mb-4">${title}</h2>` : "";
      const textHtml = text ? `<p class="text-lg text-gray-600 max-w-2xl mx-auto">${text}</p>` : "";
      const headerHtml = (title || text) ? `<div class="max-w-4xl w-full text-center mb-8">${titleHtml}${textHtml}</div>` : "";
      const anchorAttr = props.anchorId ? `id="${escapeHtml(props.anchorId)}"` : '';

      return `
        <!-- VideoBlock -->
        <div ${anchorAttr} class="w-full  px-4 flex flex-col items-center  mx-auto" ${inlineStyle}>
          ${headerHtml}
          ${url ? `
          <figure class="max-w-4xl w-full">
            <video src="${url}" controls ${autoPlayStr} class="w-full h-auto rounded-theme shadow-xl object-cover bg-black"></video>
          </figure>` : ''}
        </div>
      `;
    }

    case 'AvatarGridBlock': {
      const colStr = props.columns || '3';
      const colClass = colStr === '2' ? 'md:grid-cols-2' : colStr === '4' ? 'md:grid-cols-4' : 'md:grid-cols-3';
      
      const customBg = props.bgType === 'custom' && props.bgColor ? `style="background-color: ${escapeHtml(props.bgColor)};"` : '';
      const bgClassGrid = props.bgType === 'transparent' ? 'bg-transparent' : (props.bgType === 'custom' ? '' : 'bg-white');
      const borderClassGrid = props.noShadow || props.bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';

      let gridContent = "";
      for (let i = 1; i <= parseInt(colStr); i++) {
        const fData = props[`f${i}`] || {};
        const name = parseRichText(fData.name || '');
        const desc = parseRichText(fData.description || '');
        const avatarUrl = fData.avatarUrl ? processUrl(fData.avatarUrl, true) : "";

        const avatarHtml = avatarUrl
          ? `<img src="${avatarUrl}" alt="${escapeHtml(fData.name || '')}" class="w-full h-full object-cover" />`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 text-gray-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;

        gridContent += `
          <div class="flex flex-col items-center text-center p-8 rounded-theme ${bgClassGrid} ${borderClassGrid}" ${customBg}>
            <div class="w-24 h-24 rounded-full overflow-hidden mb-6 bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
              ${avatarHtml}
            </div>
            ${name ? `<h4 class="text-xl font-bold mb-2">${name}</h4>` : ''}
            ${desc ? `<p class="text-gray-500 text-sm">${desc}</p>` : ''}
          </div>
        `;
      }

      const anchorAttr = props.anchorId ? `id="${escapeHtml(props.anchorId)}"` : '';

      return `
        <!-- AvatarGridBlock -->
        <div ${anchorAttr} class="w-full  px-4" ${inlineStyle}>
          <div class="max-w-7xl mx-auto grid grid-cols-1 ${colClass} gap-8">
            ${gridContent}
          </div>
        </div>
      `;
    }

    case 'CarouselBlock': {
      const slidesCountStr = props.slidesCount || '3';
      const autoPlay = props.autoPlay !== false;
      const anchorAttr = props.anchorId ? `id="${escapeHtml(props.anchorId)}"` : '';

      let slidesContent = "";
      for (let i = 1; i <= parseInt(slidesCountStr); i++) {
        const sData = props[`s${i}`] || {};
        const title = parseRichText(sData.title || "");
        const desc = parseRichText(sData.description || "");
        const image = sData.image ? processUrl(sData.image, true) : "";

        const aspectRatio = props.aspectRatio || 'mixed';
        const aspectClass = aspectRatio === '16/9' ? 'aspect-video' : aspectRatio === '1/1' ? 'aspect-square' : aspectRatio === '9/16' ? 'aspect-[9/16]' : '';
        const imgClass = aspectRatio !== 'mixed' ? 'w-full h-full object-cover' : 'w-full h-auto max-h-[60vh] object-contain';

        const imageHtml = image 
          ? `<img src="${image}" alt="${escapeHtml(sData.title || '')}" class="${imgClass}" />` 
          : `<div class="w-full aspect-[4/3] flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12 text-gray-300"><path d="M2 3v18"/><path d="M22 3v18"/><path d="M6 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z"/></svg></div>`;

        slidesContent += `
          <div class="snap-center shrink-0 w-[85vw] md:w-[60vw] lg:w-[40vw] flex flex-col items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-theme shadow-sm overflow-hidden">
            <div class="w-full flex items-center justify-center overflow-hidden relative bg-gray-50 dark:bg-gray-800 ${aspectClass}">
              ${imageHtml}
            </div>
            ${(title || desc) ? `
              <div class="p-6 text-center w-full">
                ${title ? `<h3 class="text-xl font-bold mb-2">${title}</h3>` : ''}
                ${desc ? `<p class="text-gray-500 text-sm">${desc}</p>` : ''}
              </div>
            ` : ''}
          </div>
        `;
      }

      const blockId = props.anchorId ? escapeHtml(props.anchorId) : 'carousel_' + Math.random().toString(36).substring(2, 9);
      const autoPlayScript = autoPlay ? `
        <script>
          window.addEventListener('load', function() {
            var container = document.getElementById('scroll_container_${blockId}');
            if (!container) return;
            var slides = container.children;
            var currentIndex = 0;
            if (slides.length <= 1) return;
            setInterval(function() {
              currentIndex = (currentIndex + 1) % slides.length;
              var target = slides[currentIndex];
              if (target) {
                container.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
              }
            }, 4000);
          });
        </script>
      ` : '';

      return `
        <!-- CarouselBlock -->
        <div ${anchorAttr ? `id="${blockId}"` : `id="wrap_${blockId}"`} class="w-full  px-4 overflow-hidden relative group" ${inlineStyle}>
          <style>
            #scroll_container_${blockId}::-webkit-scrollbar { display: none; }
          </style>
          <div id="scroll_container_${blockId}" class="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8" style="scrollbar-width: none; -ms-overflow-style: none;">
            ${slidesContent}
          </div>
          ${autoPlayScript}
        </div>
      `;
    }

    case 'LeadCaptureBlock': {
      const headline = escapeHtml(props.headline || "Werde Teil der Community!");
      const subline = escapeHtml(props.subline || "Melde dich für unseren Newsletter an und erhalte exklusive Angebote direkt in dein Postfach.");
      const buttonText = escapeHtml(props.buttonText || "Kostenlos eintragen");
      const endpoint = escapeHtml(props.endpoint || '');
      
      const customBg = props.bgType === 'custom' && props.bgColor ? `style="background-color: ${escapeHtml(props.bgColor)};"` : '';
      const bgClass = props.bgType === 'transparent' ? 'bg-transparent' : (props.bgType === 'custom' ? '' : 'bg-white');
      const borderClass = props.noShadow || props.bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';
      const anchorAttr = props.anchorId ? `id="${escapeHtml(props.anchorId)}"` : '';
      const decoHtml = props.showDecoration ? `<div class="absolute top-1/2 left-0 -ml-20 -mt-20 w-64 h-64 rounded-full bg-secondary blur-[60px] opacity-20 pointer-events-none z-0"></div>` : "";

      return `
        <!-- LeadCaptureBlock -->
        <div ${anchorAttr} class="w-full  mx-auto rounded-theme my-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8 ${bgClass} ${borderClass}"  ${inlineStyle}>
          ${decoHtml}
          <div class="relative z-10 flex-1">
            <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">${headline}</h3>
            <p class="text-gray-500 leading-relaxed max-w-md">${subline}</p>
          </div>
          <div class="relative z-10 w-full md:w-auto shrink-0 border border-gray-200 p-2 rounded-lg bg-white/50 backdrop-blur">
            <form action="${endpoint}" method="POST" class="flex flex-col sm:flex-row gap-2 m-0">
              <input type="email" name="email" required placeholder="deine@email.de" class="px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64" />
              <button type="submit" class="px-6 py-3 bg-primary text-white font-medium rounded-md hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer">${buttonText}</button>
            </form>
          </div>
        </div>
      `;
    }

    case 'PricingBlock': {
      const headline = escapeHtml(props.headline || "Einfache, transparente Preise");
      const subline = escapeHtml(props.subline || "Wähle den Plan, der am besten zu deinem Unternehmen passt. Keine versteckten Kosten.");
      const t1Name = escapeHtml(props.tier1Name || "Starter");
      const t1Price = escapeHtml(props.tier1Price || "0€");
      const t1Feat = escapeHtml(props.tier1Features || "1 Benutzer, 5 Projekte, Basic Support");
      
      const t2Name = escapeHtml(props.tier2Name || "Pro");
      const t2Price = escapeHtml(props.tier2Price || "29€");
      const t2Feat = escapeHtml(props.tier2Features || "5 Benutzer, Unlimitierte Projekte, Priority Support");
      const t2High = props.tier2Highlight !== false;
      
      const t3Name = escapeHtml(props.tier3Name || "Enterprise");
      const t3Price = escapeHtml(props.tier3Price || "99€");
      const t3Feat = escapeHtml(props.tier3Features || "Unlimitierte Benutzer, Unlimitierte Projekte, 24/7 Phone Support");
      
      const bgType = props.bgType || 'default';
      const bgColor = props.bgColor;
      const noShadow = props.noShadow || false;
      
      const customBg = bgType === 'custom' && bgColor ? `style="background-color: ${escapeHtml(bgColor)};"` : '';
      const bgClassGrid = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : 'bg-white');
      const borderClassGrid = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';
      const anchorAttr = props.anchorId ? `id="${escapeHtml(props.anchorId)}"` : '';

      const renderFeat = (fStr) => fStr.split(',').map(f => `<li class="flex items-center gap-2 text-sm text-gray-600 mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><polyline points="20 6 9 17 4 12"></polyline></svg>${escapeHtml(f.trim())}</li>`).join('');

      return `
        <!-- PricingBlock -->
        <div ${anchorAttr} class="w-full  px-4  mx-auto flex flex-col items-center" ${inlineStyle}>
          <div class="text-center max-w-3xl mb-12">
            <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">${headline}</h2>
            <p class="text-lg text-gray-500">${subline}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            <div class="p-8 rounded-theme flex flex-col ${bgClassGrid} ${borderClassGrid}" ${customBg}>
              <h3 class="text-xl font-bold text-gray-900 mb-2">${t1Name}</h3>
              <div class="text-3xl font-extrabold text-gray-900 mb-6">${t1Price}<span class="text-sm font-normal text-gray-500">/Monat</span></div>
              <ul class="mb-8 flex-1">${renderFeat(t1Feat)}</ul>
              <button class="w-full py-3 px-4 border border-gray-200 text-gray-900 font-medium rounded-theme hover:border-primary transition-colors cursor-pointer">Starten</button>
            </div>
            
            <div class="p-8 rounded-theme flex flex-col relative ${bgClassGrid} ${t2High ? 'ring-2 ring-primary shadow-xl scale-105 z-10' : borderClassGrid}" ${customBg}>
              ${t2High ? `<div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full">Am beliebtesten</div>` : ''}
              <h3 class="text-xl font-bold text-gray-900 mb-2">${t2Name}</h3>
              <div class="text-3xl font-extrabold text-gray-900 mb-6">${t2Price}<span class="text-sm font-normal text-gray-500">/Monat</span></div>
              <ul class="mb-8 flex-1">${renderFeat(t2Feat)}</ul>
              <button class="w-full py-3 px-4 bg-primary text-white font-medium rounded-theme hover:opacity-90 transition-opacity cursor-pointer">Starten</button>
            </div>
            
            <div class="p-8 rounded-theme flex flex-col ${bgClassGrid} ${borderClassGrid}" ${customBg}>
              <h3 class="text-xl font-bold text-gray-900 mb-2">${t3Name}</h3>
              <div class="text-3xl font-extrabold text-gray-900 mb-6">${t3Price}<span class="text-sm font-normal text-gray-500">/Monat</span></div>
              <ul class="mb-8 flex-1">${renderFeat(t3Feat)}</ul>
              <button class="w-full py-3 px-4 border border-gray-200 text-gray-900 font-medium rounded-theme hover:border-primary transition-colors cursor-pointer">Kontaktieren</button>
            </div>
          </div>
        </div>
      `;
    }

    case 'FaqBlock': {
      const headline = escapeHtml(props.headline || "Häufig gestellte Fragen");
      const subline = escapeHtml(props.subline || "Hier findest du schnelle Antworten auf die wichtigsten Fragen.");
      const bgType = props.bgType || 'default';
      const bgColor = props.bgColor;
      const noShadow = props.noShadow || false;
      
      const customBg = bgType === 'custom' && bgColor ? `style="background-color: ${escapeHtml(bgColor)};"` : '';
      const bgClassGrid = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : 'bg-white');
      const borderClassGrid = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';
      const anchorAttr = props.anchorId ? `id="${escapeHtml(props.anchorId)}"` : '';

      let items = [
        { q: "Wie kann ich mein Abonnement kündigen?", a: "Du kannst dein Abonnement jederzeit in den Kontoeinstellungen unter 'Abrechnung' kündigen. Nach der Kündigung kannst du den Service noch bis zum Ende der laufenden Abrechnungsperiode nutzen." },
        { q: "Gibt es eine kostenlose Testphase?", a: "Ja, wir bieten eine 14-tägige kostenlose Testphase für alle neuen Nutzer an. Es ist keine Kreditkarte erforderlich." },
        { q: "Welche Zahlungsmethoden werden akzeptiert?", a: "Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, American Express) sowie PayPal und SEPA-Lastschrift." }
      ];
      try {
        if (props.faqs) items = JSON.parse(props.faqs);
      } catch(e) {}

      const itemsHtml = items.map(item => `
        <details class="group ${bgClassGrid} ${borderClassGrid} rounded-theme overflow-hidden mb-4" ${customBg}>
          <summary class="flex items-center justify-between p-6 font-bold text-gray-900 cursor-pointer list-none select-none">
            <span>${escapeHtml(item.q)}</span>
            <span class="transition group-open:rotate-180">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </span>
          </summary>
          <div class="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
            ${escapeHtml(item.a)}
          </div>
        </details>
      `).join('');

      return `
        <!-- FaqBlock -->
        <div ${anchorAttr} class="w-full  px-6  mx-auto flex flex-col items-center" ${inlineStyle}>
          <div class="text-center w-full mb-12">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-4">${headline}</h2>
            <p class="text-lg text-gray-500">${subline}</p>
          </div>
          <div class="w-full flex flex-col">
            ${itemsHtml}
          </div>
        </div>
      `;
    }

    case 'TestimonialBlock': {
      const headline = escapeHtml(props.headline || "Was unsere Kunden sagen");
      const subline = escapeHtml(props.subline || "Schließe dich tausenden zufriedenen Nutzern an.");
      const bgType = props.bgType || 'default';
      const bgColor = props.bgColor;
      const noShadow = props.noShadow || false;
      
      const customBg = bgType === 'custom' && bgColor ? `style="background-color: ${escapeHtml(bgColor)};"` : '';
      const bgClassGrid = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : 'bg-white');
      const borderClassGrid = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';
      const anchorAttr = props.anchorId ? `id="${escapeHtml(props.anchorId)}"` : '';

      let items = [
        { quote: "Seit wir dieses Tool nutzen, hat sich unsere Produktivität verdoppelt. Einfach überragend!", author: "Sarah Müller", role: "CEO, TechFlow", stars: 5 },
        { quote: "Der Support ist blitzschnell und die Software unfassbar intuitiv. Eine absolute Empfehlung.", author: "Markus Schmidt", role: "Freelancer", stars: 5 },
        { quote: "Beste Entscheidung des Jahres. Hat uns extrem viel Zeit und Kopfschmerzen erspart.", author: "Julia Weber", role: "Projektleiterin", stars: 4 }
      ];
      try {
        if (props.testimonials) items = JSON.parse(props.testimonials);
      } catch(e) {}

      const renderStars = (count) => {
        let h = '';
        for(let i=0; i<5; i++) {
          const filled = i < count;
          h += `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${filled ? 'text-yellow-400' : 'text-gray-300'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
        }
        return h;
      };

      const itemsHtml = items.map(item => {
        const imgSection = item.image 
          ? `<img src="${escapeStyleUrl(item.image)}" alt="${escapeHtml(item.author)}" class="w-12 h-12 rounded-full object-cover shadow-sm" />`
          : `<div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">${escapeHtml(item.author.charAt(0))}</div>`;
          
        return `
          <div class="p-8 rounded-theme flex flex-col gap-6 ${bgClassGrid} ${borderClassGrid}" ${customBg}>
            <div class="flex gap-1">${renderStars(item.stars)}</div>
            <p class="text-gray-700 italic leading-relaxed flex-1">"${escapeHtml(item.quote)}"</p>
            <div class="flex items-center gap-4 mt-2">
              ${imgSection}
              <div>
                <div class="font-bold text-gray-900">${escapeHtml(item.author)}</div>
                <div class="text-sm text-gray-500">${escapeHtml(item.role)}</div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <!-- TestimonialBlock -->
        <div ${anchorAttr} class="w-full  px-6  mx-auto flex flex-col items-center" ${inlineStyle}>
          <div class="text-center w-full mb-12">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-4">${headline}</h2>
            <p class="text-lg text-gray-500">${subline}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            ${itemsHtml}
          </div>
        </div>
      `;
    }

    default:
      return ``;
  }
}

function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseRichText(unsafe) {
  if (typeof unsafe !== 'string') return '';
  let parsed = escapeHtml(unsafe);
  parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  parsed = parsed.replace(/\+\+(.*?)\+\+/g, '<span class="text-primary">$1</span>');
  parsed = parsed.replace(/--(.*?)--/g, '<span class="text-secondary">$1</span>');
  parsed = parsed.replace(/\n/g, '<br>');
  return parsed;
}

function escapeStyleUrl(url) {
  if (typeof url !== 'string') return '';
  return url.replace(/"/g, '%22');
}
