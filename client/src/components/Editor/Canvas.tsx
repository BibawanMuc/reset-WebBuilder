import { useProjectStore } from '../../store/useProjectStore';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCanvasBlock } from './SortableCanvasBlock';
import { useState } from 'react';
import { parseRichText } from '../../utils/textParser';
import { X } from 'lucide-react';

export const Canvas = () => {
  const { activeProject, selectedBlockId, setSelectedBlockId } = useProjectStore();
  const [activeModal, setActiveModal] = useState<'impressum' | 'privacy' | null>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
  });

  if (!activeProject) return null;

  const blocks = activeProject.pages[0].blocks;
  const theme = activeProject.config?.theme || {};
  const fontFamily = activeProject.config?.font || 'Inter';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@400;500;600;700;800&display=swap`;

  let backgroundStyle: React.CSSProperties = { backgroundColor: theme.backgroundColor || '#ffffff' };
  
  if (theme.backgroundColor2 && theme.backgroundColor2 !== theme.backgroundColor) {
    backgroundStyle = {
      background: `linear-gradient(135deg, ${theme.backgroundColor || '#ffffff'}, ${theme.backgroundColor2})`
    };
  }

  const canvasStyle = {
    // Aliases for export context (optional)
    '--theme-primary': theme.primaryColor || '#000000',
    '--theme-secondary': theme.secondaryColor || '#a855f7',
    '--theme-radius': theme.borderRadius || '1.5rem',
    // Exact mapping for Tailwind v4 utility values!
    '--color-primary': theme.primaryColor || '#000000',
    '--color-secondary': theme.secondaryColor || '#a855f7',
    '--radius-theme': theme.borderRadius || '1.5rem',
    color: theme.textColor || '#111827',
    fontFamily: `"${fontFamily}", sans-serif`,
    ...backgroundStyle
  } as React.CSSProperties;

  return (
    <div 
      className="w-full max-w-5xl shadow-xl min-h-full rounded-t-2xl overflow-hidden flex flex-col items-center relative"
      onClick={() => setSelectedBlockId(null)} // Klick auf Canvas deselektiert
      style={canvasStyle}
    >
      <style>{`@import url('${fontUrl}');`}</style>

      {/* Separater Background-Image Layer für Opacity-Steuerung */}
      {theme.backgroundImage && (
        <div 
          className="absolute inset-x-0 bottom-0 pointer-events-none z-0"
          style={{
            top: '40px', // Unterhalb der "Browser"-Leiste
            backgroundImage: `url('${theme.backgroundImage}')`,
            backgroundSize: theme.backgroundSize === 'contain' ? 'contain' : (theme.backgroundSize === 'repeat' ? 'auto' : 'cover'),
            backgroundRepeat: theme.backgroundSize === 'repeat' ? 'repeat' : 'no-repeat',
            backgroundPosition: 'center',
            opacity: theme.backgroundOpacity ?? 1,
          }}
        />
      )}

      <div className="w-full bg-gray-100 h-10 border-b border-gray-200 flex items-center px-4 gap-2 shrink-0 relative z-10">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
        <div className="ml-4 bg-white px-4 py-1 rounded text-xs text-gray-500 font-mono shadow-sm">
          localhost:3000{activeProject.pages[0].route}
        </div>
      </div>

      <div 
        ref={setNodeRef}
        className={`w-full p-8 pb-64 flex flex-col min-h-[500px] transition-colors relative z-10 ${isOver ? 'bg-blue-50/50' : ''}`}
      >
        {blocks.length === 0 ? (
          <div className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 bg-gray-50/50">
            <p>Ziehe einen Baustein aus der Sidebar hierher.</p>
          </div>
        ) : (
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {blocks.map(b => (
                <SortableCanvasBlock key={b.id} block={b} />
              ))}
            </div>
          </SortableContext>
        )}
      </div>

      {theme.showScrollToTop && (
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            if (blocks.length > 0) {
              document.getElementById(blocks[0].id)?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="absolute bottom-8 right-8 w-12 h-12 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:opacity-90 transition-opacity z-50 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
      )}

      {/* Footer Links */}
      <footer className="w-full max-w-7xl mx-auto py-8 mt-4 border-t border-gray-200 flex justify-center gap-6 text-sm text-gray-500 relative z-10">
        <button onClick={(e) => { e.stopPropagation(); setActiveModal('impressum'); }} className="hover:underline hover:text-gray-900 cursor-pointer">Impressum</button>
        <button onClick={(e) => { e.stopPropagation(); setActiveModal('privacy'); }} className="hover:underline hover:text-gray-900 cursor-pointer">Datenschutz</button>
      </footer>

      {/* Overlay Modal */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); setActiveModal(null); }}
        >
          <div 
            className="bg-white text-gray-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" 
            onClick={e => e.stopPropagation()}
            style={{ fontFamily: `"${fontFamily}", sans-serif` }}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">{activeModal === 'impressum' ? 'Impressum' : 'Datenschutz'}</h2>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div 
                className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: parseRichText(
                    activeModal === 'impressum' 
                      ? (activeProject.config?.impressumText ?? `**Angaben gem&auml;&szlig; &sect; 5 TMG**\n[Firma / Vorname Name]\n[Stra&szlig;e Hausnummer]\n[PLZ Ort]\n\n**Kontakt**\nTelefon: [Telefonnummer]\nE-Mail: [E-Mail-Adresse]\n\n**Umsatzsteuer-ID**\nUmsatzsteuer-Identifikationsnummer gem&auml;&szlig; &sect; 27 a Umsatzsteuergesetz:\n[DE123456789]`) 
                      : (activeProject.config?.privacyText ?? `**1. Datenschutz auf einen Blick**\nDie folgenden Hinweise geben einen einfachen &Uuml;berblick dar&uuml;ber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.\n\n**Verantwortliche Stelle**\n[Firma / Vorname Name]\n[Stra&szlig;e Hausnummer]\n[PLZ Ort]\nE-Mail: [E-Mail-Adresse]\n\n**2. Datenerfassung auf dieser Website**\nIhre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Daten, die beim Besuch der Website anfallen (z.B. IP-Adressen), werden zur Fehlerbehebung oder Analyse auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO verarbeitet.`)
                  )
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
