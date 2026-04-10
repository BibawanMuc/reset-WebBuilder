import { useProjectStore } from '../../../store/useProjectStore';

interface LeadCaptureBlockProps {
  headline?: string;
  subline?: string;
  buttonText?: string;
  endpoint?: string;
  bgType?: string;
  bgColor?: string;
  noShadow?: boolean;
  showDecoration?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
}

export const LeadCaptureBlock = ({ 
  headline = "Werde Teil der Community!", 
  subline = "Melde dich für unseren Newsletter an und erhalte exklusive Angebote direkt in dein Postfach.", 
  buttonText = "Kostenlos eintragen",
  bgType = 'default', 
  bgColor, 
  noShadow = false, 
  showDecoration = false,
  paddingTop = 4, paddingBottom = 4, maxWidth = 100
}: LeadCaptureBlockProps) => {
  const customBg = bgType === 'custom' && bgColor ? { backgroundColor: bgColor } : {};
  const bgClass = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : 'bg-white');
  const borderClass = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';

  return (
    <div className={`w-full mx-auto relative`} style={{ paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem`, maxWidth: `${maxWidth}%` }}>
      <div className={`w-full rounded-theme overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8 ${bgClass} ${borderClass}`} style={customBg}>
      {/* Decorative gradient blob */}
      {showDecoration && (
        <div className="absolute top-1/2 left-0 -ml-20 -mt-20 w-64 h-64 rounded-full bg-secondary blur-[60px] opacity-20 pointer-events-none z-0"></div>
      )}

      <div className="relative z-10 flex-1">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{headline}</h3>
        <p className="text-gray-500 leading-relaxed max-w-md">{subline}</p>
      </div>

      <div className="relative z-10 w-full md:w-auto shrink-0 border border-gray-200 p-2 rounded-lg bg-white/50 backdrop-blur flex flex-col sm:flex-row gap-2">
        <input 
          type="email" 
          placeholder="deine@email.de" 
          className="px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64 pointer-events-none"
        />
        <button className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:opacity-90 transition-opacity pointer-events-none whitespace-nowrap">
          {buttonText}
        </button>
      </div>
    </div>
  </div>
  );
};
