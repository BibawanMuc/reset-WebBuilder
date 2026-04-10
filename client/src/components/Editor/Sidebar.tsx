import { useState, useRef } from 'react';
import { Type, Image as ImageIcon, LayoutTemplate, Link, X, Navigation, Grid, Columns, Upload, ChevronDown, ChevronUp, Film, Users, GalleryHorizontal, Dices, Mail, CreditCard, HelpCircle, MessageSquare, Wand2, Loader2 } from 'lucide-react';
import { DraggableBlockType } from './DraggableBlockType';
import { useProjectStore } from '../../store/useProjectStore';
import { api } from '../../lib/api';

const AVAILABLE_BLOCKS = [
  { type: 'NavbarBlock', label: 'Navigation', icon: Navigation },
  { type: 'HeroSection', label: 'Hero Header', icon: LayoutTemplate },
  { type: 'CarouselBlock', label: 'Carousel Slider', icon: GalleryHorizontal },
  { type: 'AvatarGridBlock', label: 'Avatar Cards', icon: Users },
  { type: 'FeaturesGridBlock', label: 'Features Grid', icon: Grid },
  { type: 'SplitBlock', label: 'Spalten Layout', icon: Columns },
  { type: 'LeadCaptureBlock', label: 'Lead Formular', icon: Mail },
  { type: 'PricingBlock', label: 'Pricing Table', icon: CreditCard },
  { type: 'FaqBlock', label: 'FAQ', icon: HelpCircle },
  { type: 'TestimonialBlock', label: 'Testimonials', icon: MessageSquare },
  { type: 'TextBlock', label: 'Text Block', icon: Type },
  { type: 'ImageBlock', label: 'Bild', icon: ImageIcon },
  { type: 'VideoBlock', label: 'Video', icon: Film },
  { type: 'ButtonBlock', label: 'Button', icon: Link },
];

export const Sidebar = () => {
  const { activeProject, setActiveProject, selectedBlockId, setSelectedBlockId, updateBlock } = useProjectStore();
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false);
  const [legalSettingsOpen, setLegalSettingsOpen] = useState(false);
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if(!selectedBlockId) return;
    const selectedBlock = activeProject?.pages[0].blocks.find(b => b.id === selectedBlockId);
    if (!selectedBlock) return;

    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:3001/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockType: selectedBlock.type, topic: aiPrompt })
      });
      const data = await res.json();
      const updates: any = {};
      
      if(data.headline) updates.headline = data.headline;
      if(selectedBlock.type === 'HeroSection' && data.subline) updates.subline = data.subline;
      if(selectedBlock.type === 'TextBlock' && data.text) updates.content = data.text;
      
      if(data.subline && (selectedBlock.type === 'PricingBlock' || selectedBlock.type === 'FaqBlock' || selectedBlock.type === 'TestimonialBlock' || selectedBlock.type === 'LeadCaptureBlock')) {
        updates.subline = data.subline;
      }
      
      if(Object.keys(updates).length > 0) {
        updateBlock(selectedBlock.id, updates);
      }
      setAiPrompt("");
    } catch(err) {
      alert("Fehler bei der KI Generierung.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!activeProject) return null;

  const selectedBlock = activeProject.pages[0].blocks.find(b => b.id === selectedBlockId);
  const theme = activeProject.config?.theme || {};

  const updateTheme = (updates: Partial<typeof theme>) => {
    setActiveProject({
      ...activeProject,
      config: {
        ...activeProject.config,
        theme: { ...theme, ...updates }
      }
    });
  };

  const handleFileUpload = async (file: File, blockId: string, property: string) => {
    try {
      const url = await api.uploadFile(file);
      updateBlock(blockId, { [property]: url });
    } catch(err) {
      alert("Fehler beim Hochladen.");
      console.error(err);
    }
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 shrink-0 flex flex-col h-full">
      {selectedBlock ? (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-sm font-bold text-gray-800">Block bearbeiten</h3>
            <button onClick={() => setSelectedBlockId(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
          <div className="p-6 flex-1 overflow-auto space-y-6">
            <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded text-xs font-mono inline-block">
              {selectedBlock.type}
            </div>

            {/* AI Assistant Section */}
            {['HeroSection', 'TextBlock', 'PricingBlock', 'FaqBlock', 'TestimonialBlock', 'LeadCaptureBlock', 'FeaturesGridBlock'].includes(selectedBlock.type) && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 size={16} className="text-indigo-500" />
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Magic AI</h4>
                </div>
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    placeholder="Worum geht es hier? (Thema)"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    className="w-full border border-indigo-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                  <button 
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="flex justify-center items-center gap-2 w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : 'Texte Generieren'}
                  </button>
                </div>
              </div>
            )}

            {/* Inpsector: Navbar */}
            {selectedBlock.type === 'NavbarBlock' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Logo Name / Title</label>
                  <input 
                    type="text"
                    value={selectedBlock.props.logoText || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { logoText: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black mb-4"
                    placeholder="Mein Projekt"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Navigations-Links</label>
                  <p className="text-xs text-gray-400 mb-2">Kommagetrennte Wörter (z.B. Home, Über uns, Kontakt)</p>
                  <textarea 
                    value={selectedBlock.props.links || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { links: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20 focus:ring-1 focus:ring-black"
                    placeholder="Home, Über uns, Kontakt"
                  />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id="hideBtnNav"
                    checked={selectedBlock.props.hideButton || false}
                    onChange={e => updateBlock(selectedBlock.id, { hideButton: e.target.checked })}
                  />
                  <label htmlFor="hideBtnNav" className="text-sm font-medium text-gray-700">Button ausblenden?</label>
                </div>
              </>
            )}

            {/* Inpsector: HeroSection */}
            {selectedBlock.type === 'HeroSection' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Überschrift</label>
                  <textarea 
                    value={selectedBlock.props.headline || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { headline: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20 focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Untertitel</label>
                  <textarea 
                    value={selectedBlock.props.subline || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { subline: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent min-h-[100px]"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Tipp: ++Farbe++, **Fett**, *Kursiv* (kombinierbar: ++*Fett & Farbig*++)</p>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id="hideBtnHero"
                    checked={!selectedBlock.props.hideButton}
                    onChange={e => updateBlock(selectedBlock.id, { hideButton: !e.target.checked })}
                  />
                  <label htmlFor="hideBtnHero" className="text-sm font-medium text-gray-700">Button anzeigen?</label>
                </div>

                {!selectedBlock.props.hideButton && (
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Button Text</label>
                    <input 
                      type="text"
                      value={selectedBlock.props.buttonText || ''} 
                      onChange={e => updateBlock(selectedBlock.id, { buttonText: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                    />
                  </div>
                )}
              </>
            )}

            {/* Inpsector: TextBlock */}
            {selectedBlock.type === 'TextBlock' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Titel (Optional)</label>
                  <input 
                    type="text"
                    value={selectedBlock.props.title || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { title: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Text-Inhalt</label>
                  <textarea 
                    value={selectedBlock.props.content || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { content: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-40 focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Ausrichtung</label>
                  <select 
                    value={selectedBlock.props.alignment || 'left'} 
                    onChange={e => updateBlock(selectedBlock.id, { alignment: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  >
                    <option value="left">Links</option>
                    <option value="center">Mittig</option>
                    <option value="right">Rechts</option>
                  </select>
                </div>
              </>
            )}

            {/* Inpsector: FeaturesGridBlock */}
            {selectedBlock.type === 'FeaturesGridBlock' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Anzahl Spalten</label>
                  <select 
                    value={selectedBlock.props.columns || '3'} 
                    onChange={e => updateBlock(selectedBlock.id, { columns: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  >
                    <option value="2">2 Spalten</option>
                    <option value="3">3 Spalten</option>
                    <option value="4">4 Spalten</option>
                  </select>
                </div>

                {Array.from({ length: parseInt(selectedBlock.props.columns || '3') }).map((_, i) => {
                  const fKey = `f${i + 1}`;
                  const defaultData = [
                    { icon: 'star', title: 'Feature 1', text: 'Beschreibe hier dein erstes tolles Feature.' },
                    { icon: 'zap', title: 'Feature 2', text: 'Was macht dein Produkt oder deinen Service einzigartig?' },
                    { icon: 'shield', title: 'Feature 3', text: 'Überzeuge die Kunden mit handfesten Argumenten.' },
                    { icon: 'heart', title: 'Feature 4', text: 'Ein weiteres wichtiges Merkmal.' }
                  ][i] || {};
                  
                  const fData = selectedBlock.props[fKey] || defaultData;
                  
                  return (
                    <div key={i} className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-bold text-gray-600 mb-3">Zelle {i + 1}</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Titel</label>
                          <input 
                            type="text" 
                            value={fData.title || ''} 
                            onChange={e => updateBlock(selectedBlock.id, { [fKey]: { ...fData, title: e.target.value }})}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Text</label>
                          <textarea 
                            value={fData.text || ''} 
                            onChange={e => updateBlock(selectedBlock.id, { [fKey]: { ...fData, text: e.target.value }})}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm h-16 focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Icon</label>
                          <select 
                            value={fData.icon || 'star'} 
                            onChange={e => updateBlock(selectedBlock.id, { [fKey]: { ...fData, icon: e.target.value }})}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black"
                          >
                            <option value="star">Stern (Star)</option>
                            <option value="zap">Blitz (Zap)</option>
                            <option value="shield">Schild (Shield)</option>
                            <option value="heart">Herz (Heart)</option>
                            <option value="lightbulb">Idee (Lightbulb)</option>
                            <option value="box">Box (Box)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {/* Inpsector: AvatarGridBlock */}
            {selectedBlock.type === 'AvatarGridBlock' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Anzahl Spalten</label>
                  <select 
                    value={selectedBlock.props.columns || '3'} 
                    onChange={e => updateBlock(selectedBlock.id, { columns: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  >
                    <option value="2">2 Spalten</option>
                    <option value="3">3 Spalten</option>
                    <option value="4">4 Spalten</option>
                  </select>
                </div>

                {Array.from({ length: parseInt(selectedBlock.props.columns || '3') }).map((_, i) => {
                  const fKey = `f${i + 1}`;
                  const defaultData = [
                    { name: 'Max Mustermann', description: 'Gründer & CEO' },
                    { name: 'Erika Musterfrau', description: 'Head of Design' },
                    { name: 'John Doe', description: 'Lead Developer' },
                    { name: 'Jane Smith', description: 'Marketing' }
                  ][i] || {};
                  
                  const fData = selectedBlock.props[fKey] || defaultData;
                  
                  return (
                    <div key={i} className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-bold text-gray-600 mb-3">Avatar {i + 1}</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Bild</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="URL..."
                              value={fData.avatarUrl || ''} 
                              onChange={e => updateBlock(selectedBlock.id, { [fKey]: { ...fData, avatarUrl: e.target.value }})}
                              className="flex-1 w-0 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black"
                            />
                            <label className="p-1 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors shrink-0">
                              <Upload size={16} />
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={async e => {
                                  if (e.target.files && e.target.files[0]) {
                                    try {
                                      const url = await api.uploadFile(e.target.files[0]);
                                      updateBlock(selectedBlock.id, { [fKey]: { ...fData, avatarUrl: url }});
                                    } catch(err) {
                                      alert("Fehler beim Hochladen.");
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Name</label>
                          <input 
                            type="text" 
                            value={fData.name || ''} 
                            onChange={e => updateBlock(selectedBlock.id, { [fKey]: { ...fData, name: e.target.value }})}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Beschreibung/Rolle</label>
                          <textarea 
                            value={fData.description || ''} 
                            onChange={e => updateBlock(selectedBlock.id, { [fKey]: { ...fData, description: e.target.value }})}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm h-16 focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Inpsector: CarouselBlock */}
            {selectedBlock.type === 'CarouselBlock' && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <input 
                    type="checkbox" 
                    id="autoPlayCarousel"
                    checked={selectedBlock.props.autoPlay ?? true}
                    onChange={e => updateBlock(selectedBlock.id, { autoPlay: e.target.checked })}
                  />
                  <label htmlFor="autoPlayCarousel" className="text-sm font-medium text-gray-700">Auto-Play (Swipen)</label>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Anzahl Slides</label>
                  <select 
                    value={selectedBlock.props.slidesCount || '3'} 
                    onChange={e => updateBlock(selectedBlock.id, { slidesCount: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black mb-3"
                  >
                    <option value="3">3 Slides</option>
                    <option value="4">4 Slides</option>
                    <option value="5">5 Slides</option>
                    <option value="6">6 Slides</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Format (Bild-Zuschnitt)</label>
                  <select 
                    value={selectedBlock.props.aspectRatio || 'mixed'} 
                    onChange={e => updateBlock(selectedBlock.id, { aspectRatio: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  >
                    <option value="mixed">Mixed (Auto Height)</option>
                    <option value="16/9">Querformat (16:9)</option>
                    <option value="1/1">Quadrat (1:1)</option>
                    <option value="9/16">Hochformat (9:16)</option>
                  </select>
                </div>

                {Array.from({ length: parseInt(selectedBlock.props.slidesCount || '3') }).map((_, i) => {
                  const sKey = `s${i + 1}`;
                  const defaultData = { title: `Slide ${i + 1}`, description: `Beispielbeschreibung für Slide ${i + 1}` };
                  const sData = selectedBlock.props[sKey] || defaultData;
                  
                  return (
                    <div key={i} className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-bold text-gray-600 mb-3">Slide {i + 1}</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Bild</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="URL..."
                              value={sData.image || ''} 
                              onChange={e => updateBlock(selectedBlock.id, { [sKey]: { ...sData, image: e.target.value }})}
                              className="flex-1 w-0 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black"
                            />
                            <label className="p-1 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors shrink-0">
                              <Upload size={16} />
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={async e => {
                                  if (e.target.files && e.target.files[0]) {
                                    try {
                                      const url = await api.uploadFile(e.target.files[0]);
                                      updateBlock(selectedBlock.id, { [sKey]: { ...sData, image: url }});
                                    } catch(err) {
                                      alert("Fehler beim Hochladen.");
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Titel (Optional)</label>
                          <input 
                            type="text" 
                            value={sData.title || ''} 
                            onChange={e => updateBlock(selectedBlock.id, { [sKey]: { ...sData, title: e.target.value }})}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">Text (Optional)</label>
                          <textarea 
                            value={sData.description || ''} 
                            onChange={e => updateBlock(selectedBlock.id, { [sKey]: { ...sData, description: e.target.value }})}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm h-16 focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Inpsector: VideoBlock */}
            {selectedBlock.type === 'VideoBlock' && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <input 
                    type="checkbox" 
                    id="autoPlayVideo"
                    checked={selectedBlock.props.autoPlay ?? true}
                    onChange={e => updateBlock(selectedBlock.id, { autoPlay: e.target.checked })}
                  />
                  <label htmlFor="autoPlayVideo" className="text-sm font-medium text-gray-700">Auto-Play & Loop</label>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Titel</label>
                  <input 
                    type="text"
                    value={selectedBlock.props.title || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { title: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Beschreibung</label>
                  <textarea 
                    value={selectedBlock.props.text || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { text: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-24 focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Video (URL oder Upload)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="https://...mp4"
                      value={selectedBlock.props.url || ''} 
                      onChange={e => updateBlock(selectedBlock.id, { url: e.target.value })}
                      className="flex-1 w-0 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                    />
                    <label className="px-3 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors shrink-0">
                      <Upload size={18} />
                      <input 
                        type="file" 
                        accept="video/*" 
                        className="hidden" 
                        onChange={async e => {
                          if (e.target.files && e.target.files[0]) {
                            try {
                              const url = await api.uploadFile(e.target.files[0]);
                              updateBlock(selectedBlock.id, { url });
                            } catch(err) {
                              alert("Fehler beim Hochladen.");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Inpsector: SplitBlock */}
            {selectedBlock.type === 'SplitBlock' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Titel</label>
                  <input 
                    type="text"
                    value={selectedBlock.props.title || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { title: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Text</label>
                  <textarea 
                    value={selectedBlock.props.text || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { text: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20 focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Bild</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input 
                      type="text"
                      placeholder="https://..."
                      value={selectedBlock.props.imageUrl || ''} 
                      onChange={e => updateBlock(selectedBlock.id, { imageUrl: e.target.value })}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                    />
                    <label className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors">
                      <Upload size={16} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], selectedBlock.id, 'imageUrl');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id="swapSides"
                    checked={selectedBlock.props.imageLeft !== false}
                    onChange={e => updateBlock(selectedBlock.id, { imageLeft: e.target.checked })}
                  />
                  <label htmlFor="swapSides" className="text-sm font-medium text-gray-700">Bild auf der linken Seite?</label>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-gray-700">Bildbreite (Spalten)</label>
                    <span className="text-xs text-gray-500">{selectedBlock.props.imageWidth || 50}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" max="80" step="5"
                    value={selectedBlock.props.imageWidth || 50} 
                    onChange={e => updateBlock(selectedBlock.id, { imageWidth: parseInt(e.target.value) })}
                    className="w-full accent-black"
                  />
                </div>
              </>
            )}

            {/* Inpsector: ImageBlock */}
            {selectedBlock.type === 'ImageBlock' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Bild</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input 
                      type="text"
                      placeholder="https://..."
                      value={selectedBlock.props.url || ''} 
                      onChange={e => updateBlock(selectedBlock.id, { url: e.target.value })}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                    />
                    <label className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors">
                      <Upload size={16} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], selectedBlock.id, 'url');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Alt-Text</label>
                  <input 
                    type="text"
                    value={selectedBlock.props.alt || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { alt: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Bildunterschrift (Optional)</label>
                  <input 
                    type="text"
                    value={selectedBlock.props.caption || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { caption: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  />
                </div>
              </>
            )}

            {/* Inpsector: ButtonBlock */}
            {selectedBlock.type === 'ButtonBlock' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Label</label>
                  <input 
                    type="text"
                    value={selectedBlock.props.label || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { label: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Link (URL)</label>
                  <input 
                    type="text"
                    value={selectedBlock.props.url || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { url: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Variante</label>
                  <select 
                    value={selectedBlock.props.variant || 'primary'} 
                    onChange={e => updateBlock(selectedBlock.id, { variant: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  >
                    <option value="primary">Primär (Brand Color)</option>
                    <option value="secondary">Sekundär (Accent Color)</option>
                    <option value="outline">Outline</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Ausrichtung</label>
                  <select 
                    value={selectedBlock.props.alignment || 'center'} 
                    onChange={e => updateBlock(selectedBlock.id, { alignment: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  >
                    <option value="left">Links</option>
                    <option value="center">Mittig</option>
                    <option value="right">Rechts</option>
                  </select>
                </div>
              </>
            )}

            {/* Inpsector: LeadCaptureBlock */}
            {selectedBlock.type === 'LeadCaptureBlock' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Headline</label>
                  <input 
                    type="text"
                    value={selectedBlock.props.headline || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { headline: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                    placeholder="Werde Teil der Community!"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Subline</label>
                  <textarea 
                    value={selectedBlock.props.subline || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { subline: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20 focus:ring-1 focus:ring-black"
                    placeholder="Melde dich für unseren Newsletter an..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Button Text</label>
                  <input 
                    type="text"
                    value={selectedBlock.props.buttonText || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { buttonText: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                    placeholder="Kostenlos eintragen"
                  />
                </div>
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Webhook URL / API</label>
                  <input 
                    type="text"
                    value={selectedBlock.props.endpoint || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { endpoint: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-black font-mono"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Die eingegebene E-Mail Adresse wird per POST an diese URL gesendet (Feld: "email").</p>
                </div>
              </>
            )}

            {/* Inspector: PricingBlock */}
            {selectedBlock.type === 'PricingBlock' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Headline</label>
                  <input type="text" value={selectedBlock.props.headline || ''} onChange={e => updateBlock(selectedBlock.id, { headline: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black" />
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <h5 className="text-xs font-bold text-gray-900 mb-2">Paket 1 (Links)</h5>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" placeholder="Name (z.B. Starter)" value={selectedBlock.props.tier1Name || ''} onChange={e => updateBlock(selectedBlock.id, { tier1Name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-black" />
                    <input type="text" placeholder="Preis (z.B. 0€)" value={selectedBlock.props.tier1Price || ''} onChange={e => updateBlock(selectedBlock.id, { tier1Price: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-black" />
                  </div>
                  <input type="text" placeholder="Features (Komma-getrennt)" value={selectedBlock.props.tier1Features || ''} onChange={e => updateBlock(selectedBlock.id, { tier1Features: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-black" />
                </div>

                <div className="border-t border-gray-200 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-xs font-bold text-gray-900">Paket 2 (Mitte / Pro)</h5>
                    <div className="flex items-center gap-1">
                      <input type="checkbox" id="pricing_highlight" checked={selectedBlock.props.tier2Highlight !== false} onChange={e => updateBlock(selectedBlock.id, { tier2Highlight: e.target.checked })} />
                      <label htmlFor="pricing_highlight" className="text-[10px] uppercase font-bold text-primary cursor-pointer">Highlight</label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" placeholder="Name (z.B. Pro)" value={selectedBlock.props.tier2Name || ''} onChange={e => updateBlock(selectedBlock.id, { tier2Name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-black" />
                    <input type="text" placeholder="Preis (z.B. 29€)" value={selectedBlock.props.tier2Price || ''} onChange={e => updateBlock(selectedBlock.id, { tier2Price: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-black" />
                  </div>
                  <input type="text" placeholder="Features (Komma-getrennt)" value={selectedBlock.props.tier2Features || ''} onChange={e => updateBlock(selectedBlock.id, { tier2Features: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-black" />
                </div>

                <div className="border-t border-gray-200 pt-4 mt-2">
                  <h5 className="text-xs font-bold text-gray-900 mb-2">Paket 3 (Rechts)</h5>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" placeholder="Name (z.B. Enterprise)" value={selectedBlock.props.tier3Name || ''} onChange={e => updateBlock(selectedBlock.id, { tier3Name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-black" />
                    <input type="text" placeholder="Preis (z.B. 99€)" value={selectedBlock.props.tier3Price || ''} onChange={e => updateBlock(selectedBlock.id, { tier3Price: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-black" />
                  </div>
                  <input type="text" placeholder="Features (Komma-getrennt)" value={selectedBlock.props.tier3Features || ''} onChange={e => updateBlock(selectedBlock.id, { tier3Features: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-black" />
                </div>
              </>
            )}

            {/* Inspector: FaqBlock */}
            {selectedBlock.type === 'FaqBlock' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Headline</label>
                  <input type="text" value={selectedBlock.props.headline || ''} onChange={e => updateBlock(selectedBlock.id, { headline: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">FAQs (JSON)</label>
                  <textarea value={selectedBlock.props.faqs || ''} onChange={e => updateBlock(selectedBlock.id, { faqs: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-mono h-32 focus:ring-1 focus:ring-black" placeholder='[{"q": "Frage?", "a": "Antwort"}]' />
                </div>
              </>
            )}

            {/* Inspector: TestimonialBlock */}
            {selectedBlock.type === 'TestimonialBlock' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Headline</label>
                  <input type="text" value={selectedBlock.props.headline || ''} onChange={e => updateBlock(selectedBlock.id, { headline: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Testimonials (JSON)</label>
                  <textarea value={selectedBlock.props.testimonials || ''} onChange={e => updateBlock(selectedBlock.id, { testimonials: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-mono h-32 focus:ring-1 focus:ring-black" placeholder='[{"quote": "Super", "author": "Max Muster", "role": "CEO", "stars": 5}]' />
                </div>
              </>
            )}
            
            {/* Geerbte Design-Einstellungen für ALLE Blöcke */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Block Darstellung</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Hintergrund</label>
                  <select 
                    value={selectedBlock.props.bgType || 'default'} 
                    onChange={e => updateBlock(selectedBlock.id, { bgType: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-black"
                  >
                    <option value="default">Standard (Card)</option>
                    <option value="transparent">Transparent</option>
                    <option value="custom">Eigene Farbe</option>
                  </select>
                </div>

                {selectedBlock.props.bgType === 'custom' && (
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Block-Farbe</label>
                    <div className="relative">
                      <input 
                        type="color" 
                        value={selectedBlock.props.bgColor || '#ffffff'}
                        onChange={e => updateBlock(selectedBlock.id, { bgColor: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer border border-gray-300 p-0" 
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="noShadow"
                    checked={selectedBlock.props.noShadow || false}
                    onChange={e => updateBlock(selectedBlock.id, { noShadow: e.target.checked })}
                  />
                  <label htmlFor="noShadow" className="text-sm font-medium text-gray-700">Rahmen & Schatten verbergen</label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="showDecoration"
                    checked={selectedBlock.props.showDecoration || false}
                    onChange={e => updateBlock(selectedBlock.id, { showDecoration: e.target.checked })}
                  />
                  <label htmlFor="showDecoration" className="text-sm font-medium text-gray-700">Dekorativer Farbverlauf (Blob)</label>
                </div>

                <div className="pt-2 border-t mt-2">
                  <label className="text-xs font-medium text-gray-700 block mb-1">Block-ID (für Navigation)</label>
                  <input 
                    type="text"
                    placeholder="z.B. BAUEN"
                    value={selectedBlock.props.anchorId || ''} 
                    onChange={e => updateBlock(selectedBlock.id, { anchorId: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-black"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Wird in der NavBar genutzt, um genau hierher zu springen.</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-b border-gray-200 bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="text-lg">📐</span> Layout & Abstände
              </h4>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Abstand Oben</label>
                    <span className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 font-mono">{selectedBlock.props.paddingTop ?? 4}rem</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="15" step="1"
                    value={selectedBlock.props.paddingTop ?? 4}
                    onChange={e => updateBlock(selectedBlock.id, { paddingTop: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Abstand Unten</label>
                    <span className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 font-mono">{selectedBlock.props.paddingBottom ?? 4}rem</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="15" step="1"
                    value={selectedBlock.props.paddingBottom ?? 4}
                    onChange={e => updateBlock(selectedBlock.id, { paddingBottom: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Block Breite</label>
                    <span className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 font-mono">{selectedBlock.props.maxWidth ?? 100}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" max="100" step="5"
                    value={selectedBlock.props.maxWidth ?? 100}
                    onChange={e => updateBlock(selectedBlock.id, { maxWidth: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                  <p className="text-[9px] text-gray-400 mt-1">Gilt für den inneren Inhaltsbereich (max-width).</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                const newPages = [...activeProject.pages];
                newPages[0].blocks = newPages[0].blocks.filter(b => b.id !== selectedBlock.id);
                useProjectStore.getState().setActiveProject({ ...activeProject, pages: newPages });
              }}
              className="mt-6 mb-6 mx-4 w-[calc(100%-2rem)] py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Block löschen
            </button>
          </div>
        </div>
      ) : (
         <div className="flex flex-col h-full overflow-hidden">
          <div className="border-b border-gray-200 shrink-0 bg-gray-50 flex flex-col">
            <button 
              onClick={() => setGlobalSettingsOpen(!globalSettingsOpen)}
              className="p-4 flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer w-full text-left"
            >
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Globale Einstellungen</h3>
              {globalSettingsOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            
            {globalSettingsOpen && (
              <div className="p-6 pt-2 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar border-t border-gray-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase">Farben</h4>
                  <button 
                    onClick={() => {
                      const palettes = [
                        { p: '#0ea5e9', s: '#38bdf8', t: '#0f172a', b1: '#f0f9ff', b2: '#e0f2fe' },
                        { p: '#10b981', s: '#34d399', t: '#064e3b', b1: '#ecfdf5', b2: '#d1fae5' },
                        { p: '#f43f5e', s: '#fb7185', t: '#881337', b1: '#fff1f2', b2: '#ffe4e6' },
                        { p: '#8b5cf6', s: '#a78bfa', t: '#4c1d95', b1: '#f5f3ff', b2: '#ede9fe' },
                        { p: '#f59e0b', s: '#fbbf24', t: '#78350f', b1: '#fffbeb', b2: '#fef3c7' },
                        { p: '#000000', s: '#a855f7', t: '#111827', b1: '#f9fafb', b2: '#f9fafb' },
                        { p: '#4f46e5', s: '#818cf8', t: '#312e81', b1: '#eef2ff', b2: '#e0e7ff' },
                        { p: '#14b8a6', s: '#5eead4', t: '#134e4a', b1: '#f0fdfa', b2: '#ccfbf1' },
                        { p: '#ef4444', s: '#f87171', t: '#7f1d1d', b1: '#fef2f2', b2: '#fee2e2' },
                        { p: '#111827', s: '#4b5563', t: '#f9fafb', b1: '#030712', b2: '#111827' } // Dark Mode
                      ];
                      const random = palettes[Math.floor(Math.random() * palettes.length)];
                      updateTheme({
                        primaryColor: random.p,
                        secondaryColor: random.s,
                        textColor: random.t,
                        backgroundColor: random.b1,
                        backgroundColor2: random.b2
                      });
                    }}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors flex flex-row gap-1 items-center"
                    title="Zufällige Farbkombination"
                  >
                    <Dices size={16} />
                    <span className="text-[10px] font-medium uppercase">Shuffle</span>
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-gray-700">Hauptfarbe</label>
                  <div className="relative">
                    <input 
                      type="color" 
                      value={theme.primaryColor || '#000000'}
                      onChange={e => updateTheme({ primaryColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-gray-700">Sekundärfarbe</label>
                  <div className="relative">
                    <input 
                      type="color" 
                      value={theme.secondaryColor || '#a855f7'}
                      onChange={e => updateTheme({ secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-gray-700">Textfarbe</label>
                  <div className="relative">
                    <input 
                      type="color" 
                      value={theme.textColor || '#111827'}
                      onChange={e => updateTheme({ textColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t pt-4 mt-2">
                  <label className="text-sm font-medium text-gray-700">Hintergrund 1</label>
                  <div className="relative">
                    <input 
                      type="color" 
                      value={theme.backgroundColor || '#f9fafb'}
                      onChange={e => updateTheme({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Hintergrund 2</label>
                    <p className="text-[10px] text-gray-500">Für Farbverlauf</p>
                  </div>
                  <div className="relative">
                    <input 
                      type="color" 
                      value={theme.backgroundColor2 || theme.backgroundColor || '#f9fafb'}
                      onChange={e => updateTheme({ backgroundColor2: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Oder: Hintergrundbild</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      placeholder="https://..."
                      value={theme.backgroundImage || ''} 
                      onChange={e => updateTheme({ backgroundImage: e.target.value })}
                      className="flex-1 w-0 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-black"
                    />
                    <label className="p-1 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors shrink-0">
                      <Upload size={14} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async e => {
                          if (e.target.files && e.target.files[0]) {
                            try {
                              const url = await api.uploadFile(e.target.files[0]);
                              updateTheme({ backgroundImage: url });
                            } catch(err) {
                              alert("Fehler beim Hochladen.");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>

                  {theme.backgroundImage && (
                    <div className="mt-3 space-y-3 p-3 bg-gray-100 rounded-lg">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Darstellung (Fit)</label>
                        <select 
                          value={theme.backgroundSize || 'cover'}
                          onChange={e => updateTheme({ backgroundSize: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-black"
                        >
                          <option value="cover">Ausfüllen (Cover)</option>
                          <option value="contain">Einpassen (Contain)</option>
                          <option value="repeat">Kacheln (Repeat)</option>
                        </select>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-medium text-gray-600 block">Sichtbarkeit (Opacity)</label>
                          <span className="text-[10px] text-gray-500">{Math.round((theme.backgroundOpacity ?? 1) * 100)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.05" 
                          max="1" 
                          step="0.05"
                          value={theme.backgroundOpacity ?? 1}
                          onChange={e => updateTheme({ backgroundOpacity: parseFloat(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mt-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Ecken (Radius)</label>
                  <select 
                    value={theme.borderRadius || '1.5rem'}
                    onChange={e => updateTheme({ borderRadius: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
                  >
                    <option value="0px">Eckig (0px)</option>
                    <option value="0.5rem">Leicht rund (md)</option>
                    <option value="1rem">Rundum (xl)</option>
                    <option value="1.5rem">Modern (3xl)</option>
                    <option value="9999px">Pillenform (full)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Schriftart</label>
                  <select 
                    value={activeProject.config?.font || 'Inter'}
                    onChange={e => setActiveProject({ ...activeProject, config: { ...activeProject.config, font: e.target.value }})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
                  >
                    <option value="Inter">Inter (Serifenlos)</option>
                    <option value="Roboto">Roboto (Klassisch)</option>
                    <option value="Outfit">Outfit (Modern)</option>
                    <option value="Merriweather">Merriweather (Serifen)</option>
                    <option value="Playfair Display">Playfair Display (Elegant)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t mt-2">
                  <input 
                    type="checkbox" 
                    id="showScrollToTop"
                    checked={theme.showScrollToTop || false}
                    onChange={e => updateTheme({ showScrollToTop: e.target.checked })}
                  />
                  <label htmlFor="showScrollToTop" className="text-sm font-medium text-gray-700">"Nach Oben" Pfeil anzeigen</label>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t mt-2">
                  <input 
                    type="checkbox" 
                    id="enableAnimations"
                    checked={theme.enableAnimations || false}
                    onChange={e => updateTheme({ enableAnimations: e.target.checked })}
                  />
                  <label htmlFor="enableAnimations" className="text-sm font-medium text-gray-700">Elegante Scroll-Animationen (Fade-Up)</label>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t mt-2">
                  <input 
                    type="checkbox" 
                    id="enableDarkMode"
                    checked={theme.enableDarkMode || false}
                    onChange={e => updateTheme({ enableDarkMode: e.target.checked })}
                  />
                  <label htmlFor="enableDarkMode" className="text-sm font-medium text-gray-700">Dark Mode Toggle aktivieren (Export)</label>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Globales Logo</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      placeholder="Logo URL"
                      value={activeProject.config?.logo || ''} 
                      onChange={e => setActiveProject({ ...activeProject, config: { ...activeProject.config, logo: e.target.value }})}
                      className="flex-1 w-0 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-black"
                    />
                    <label className="p-1 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors shrink-0">
                      <Upload size={14} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async e => {
                          if (e.target.files && e.target.files[0]) {
                            try {
                              const url = await api.uploadFile(e.target.files[0]);
                              setActiveProject({ ...activeProject, config: { ...activeProject.config, logo: url }});
                            } catch(err) {
                              alert("Fehler beim Hochladen.");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="border-b border-gray-200 shrink-0 bg-gray-50 flex flex-col">
            <button 
              onClick={() => setLegalSettingsOpen(!legalSettingsOpen)}
              className="p-4 flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer w-full text-left"
            >
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rechtliches</h3>
              {legalSettingsOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            
            {legalSettingsOpen && (
              <div className="p-6 pt-2 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar border-t border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Impressum</label>
                  <textarea 
                    value={activeProject.config?.impressumText ?? `**Angaben gem&auml;&szlig; &sect; 5 TMG**\n[Firma / Vorname Name]\n[Stra&szlig;e Hausnummer]\n[PLZ Ort]\n\n**Kontakt**\nTelefon: [Telefonnummer]\nE-Mail: [E-Mail-Adresse]\n\n**Umsatzsteuer-ID**\nUmsatzsteuer-Identifikationsnummer gem&auml;&szlig; &sect; 27 a Umsatzsteuergesetz:\n[DE123456789]`} 
                    onChange={e => setActiveProject({ ...activeProject, config: { ...activeProject.config, impressumText: e.target.value }})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-64 focus:ring-1 focus:ring-black"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Markdown-Format (*kursiv*, **fett**) wird unterstützt.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Datenschutz</label>
                  <textarea 
                    value={activeProject.config?.privacyText ?? `**1. Datenschutz auf einen Blick**\nDie folgenden Hinweise geben einen einfachen &Uuml;berblick dar&uuml;ber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.\n\n**Verantwortliche Stelle**\n[Firma / Vorname Name]\n[Stra&szlig;e Hausnummer]\n[PLZ Ort]\nE-Mail: [E-Mail-Adresse]\n\n**2. Datenerfassung auf dieser Website**\nIhre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Daten, die beim Besuch der Website anfallen (z.B. IP-Adressen), werden zur Fehlerbehebung oder Analyse auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO verarbeitet.`} 
                    onChange={e => setActiveProject({ ...activeProject, config: { ...activeProject.config, privacyText: e.target.value }})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-64 focus:ring-1 focus:ring-black"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Markdown-Format (*kursiv*, **fett**) wird unterstützt.</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-6 flex-1 overflow-auto bg-white">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Bausteine</h3>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_BLOCKS.map((block) => (
                <DraggableBlockType 
                  key={block.type}
                  type={block.type}
                  label={block.label}
                  icon={block.icon}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
