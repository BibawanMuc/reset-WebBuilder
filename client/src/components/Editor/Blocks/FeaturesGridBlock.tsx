import { Star, Zap, Shield, Heart, Lightbulb, Box } from 'lucide-react';
import { parseRichText } from '../../../utils/textParser';

interface FeatureProps {
  icon?: string;
  title?: string;
  text?: string;
}

interface FeaturesGridBlockProps {
  columns?: '2' | '3' | '4';
  f1?: FeatureProps;
  f2?: FeatureProps;
  f3?: FeatureProps;
  f4?: FeatureProps;
  bgType?: string;
  bgColor?: string;
  noShadow?: boolean;
  showDecoration?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
}

const IconMapper = ({ name }: { name: string }) => {
  switch (name) {
    case 'zap': return <Zap className="w-6 h-6" />;
    case 'shield': return <Shield className="w-6 h-6" />;
    case 'heart': return <Heart className="w-6 h-6" />;
    case 'lightbulb': return <Lightbulb className="w-6 h-6" />;
    case 'box': return <Box className="w-6 h-6" />;
    default: return <Star className="w-6 h-6" />;
  }
};

export const FeaturesGridBlock = ({ columns = '3', f1, f2, f3, f4, bgType = 'default', bgColor, noShadow = false, showDecoration = false, paddingTop = 4, paddingBottom = 4, maxWidth = 100 }: FeaturesGridBlockProps) => {
  const colClass = columns === '2' ? 'md:grid-cols-2' : columns === '4' ? 'md:grid-cols-4' : 'md:grid-cols-3';
  
  const features = [
    f1 || { icon: 'star', title: 'Feature 1', text: 'Beschreibe hier dein erstes tolles Feature.' },
    f2 || { icon: 'zap', title: 'Feature 2', text: 'Was macht dein Produkt oder deinen Service einzigartig?' },
    f3 || { icon: 'shield', title: 'Feature 3', text: 'Überzeuge die Kunden mit handfesten Argumenten.' },
    f4 || null
  ].filter(Boolean); // Entfernt f4 wenn nicht genutzt

  // Begrenze auf benötigte Anzahl an Features
  const renderFeatures = features.slice(0, parseInt(columns));

  const customBg = bgType === 'custom' && bgColor ? { backgroundColor: bgColor } : {};
  const bgClassGrid = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : 'bg-white');
  const borderClassGrid = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';

  return (
    <div className="w-full px-6 relative overflow-hidden mx-auto" style={{ paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem`, maxWidth: `${maxWidth}%` }}>
      {/* Decorative gradient blob */}
      {showDecoration && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-secondary blur-[120px] opacity-10 pointer-events-none z-0"></div>
      )}

      <div className={`grid grid-cols-1 ${colClass} gap-x-8 gap-y-12 relative z-10`}>
        {renderFeatures.map((feat, i) => (
          <div key={i} className={`flex flex-col items-start gap-4 p-6 rounded-theme hover:shadow-lg transition-shadow ${bgClassGrid} ${borderClassGrid}`} style={customBg}>
            <div className="w-12 h-12 bg-primary text-white rounded-theme flex items-center justify-center shadow-md">
              <IconMapper name={feat?.icon || 'star'} />
            </div>
            <h3 
              className="text-xl font-bold text-gray-900"
              dangerouslySetInnerHTML={parseRichText(feat?.title || `Feature ${i+1}`)}
            />
            <p 
              className="text-gray-600 leading-relaxed text-sm md:text-base"
              dangerouslySetInnerHTML={parseRichText(feat?.text || 'Beschreibung')}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
