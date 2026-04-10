const fs = require('fs');
const path = require('path');

const dir = './client/src/components/Editor/Blocks';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Block.tsx') || f === 'HeroBlock.tsx');

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip already patched files or files without Props interface
  if (content.includes('paddingTop?: number;') || 
      !content.includes('Props {') || 
      file === 'BlockRenderer.tsx') return;

  // Add properties to interface
  content = content.replace(/(interface \w+Props \{[\s\S]*?)(bgType\?: string;|bgColor\?: string;|noShadow\?: boolean;|showDecoration\?: boolean;)([\s\S]*?\})/, (match, p1, p2, p3) => {
    return p1 + p2 + p3.replace('}', '  paddingTop?: number;\n  paddingBottom?: number;\n  maxWidth?: number;\n}');
  });

  // Since regex might fail if bgType isn't there (e.g. ImageBlock), fallback:
  if (!content.includes('paddingTop?: number;')) {
    content = content.replace(/(interface \w+Props \{[\s\S]*?)\}/, (match, p1) => {
      return p1 + '  paddingTop?: number;\n  paddingBottom?: number;\n  maxWidth?: number;\n}';
    });
  }

  // Update component props destructing
  content = content.replace(/(export const \w+ = .*?Props\) => \{)/, (match) => {
     let newMatch = match;
     if(!newMatch.includes('paddingTop')) {
         newMatch = newMatch.replace('}:', ', paddingTop = 4, paddingBottom = 4, maxWidth = 100 }:');
     }
     return newMatch;
  });

  // Find the outer w-full div and replace py-16 / max-w styles.
  // This is tricky because the return statement starts with return ( <div ...
  content = content.replace(/className="([^"]*?)w-full([^"]*?)"/, (match, prefix, suffix) => {
    let newSuffix = suffix.replace(/py-\d+/g, '').replace(/max-w-[\w-]+/g, '').trim();
    // Navbar block may not have max-w at all, but we will force mx-auto
    return `className="${prefix}w-full mx-auto ${newSuffix}" style={{ paddingTop: \`\${paddingTop}rem\`, paddingBottom: \`\${paddingBottom}rem\`, maxWidth: \`\${maxWidth}%\` }}`;
  });

  fs.writeFileSync(filePath, content);
  console.log('Patched', file);
});
