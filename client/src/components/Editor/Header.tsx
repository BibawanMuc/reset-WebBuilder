import { Save, ArrowLeft, Download, FileJson, UploadCloud } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { api } from '../../lib/api';
import { useState, useRef } from 'react';

export const Header = () => {
  const { activeProject, setActiveProject } = useProjectStore();
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    if (!activeProject) return;
    const jsonStr = JSON.stringify(activeProject, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.name.replace(/\s+/g, '_')}_template.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProject) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const importedData = JSON.parse(jsonContent);
        
        if (!importedData.id || !importedData.pages || !importedData.config) {
          throw new Error("Ungültiges Template Format.");
        }
        
        const updatedProject = {
          ...activeProject,
          pages: importedData.pages,
          config: importedData.config,
        };
        
        setActiveProject(updatedProject);
        await api.saveProject(updatedProject);
        alert('Template erfolgreich geladen und gespeichert!');
      } catch (error) {
        console.error(error);
        alert('Fehler beim Einlesen des Templates. Stelle sicher, dass es eine korrekte WebBuilder JSON-Datei ist.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (activeProject) {
      await api.saveProject(activeProject);
      alert('Projekt gespeichert!');
    }
  };

  const handleExport = async () => {
    if (!activeProject) return;
    setIsExporting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${activeProject.id}/export/html`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Export fehlgeschlagen');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProject.name.replace(/\\s+/g, '_')}_export.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert("Fehler beim Exportieren.");
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  if (!activeProject) return null;

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setActiveProject(null)}
          className="text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 
          className="font-bold text-lg cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors border border-transparent hover:border-gray-200"
          title="Projekt umbenennen"
          onClick={() => {
            const newName = prompt('Projektname ändern:', activeProject.name);
            if (newName && newName.trim() !== '' && newName !== activeProject.name) {
              setActiveProject({ ...activeProject, name: newName });
            }
          }}
        >
          {activeProject.name}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r border-gray-200 pr-4 mr-2">
          <button 
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
            title="Als Template herunterladen"
          >
            <FileJson size={16} /> JSON Export
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
            title="Template importieren"
          >
            <UploadCloud size={16} /> JSON Laden
          </button>
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImportJSON} 
          />
        </div>

        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Download size={16} /> {isExporting ? "Exportiert..." : "Export"}
        </button>
        <button 
          onClick={handleSave} 
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Save size={16} /> Speichern
        </button>
      </div>
    </header>
  );
};
