import { parseRichText } from '../../../utils/textParser';

interface TextBlockProps {
  title?: string;
  content?: string;
  alignment?: 'left' | 'center' | 'right';
  bgType?: string;
  bgColor?: string;
  noShadow?: boolean;
  showDecoration?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
}

export const TextBlock = ({ title, content, alignment = 'left', bgType = 'default', bgColor, noShadow = false, showDecoration = false, paddingTop = 4, paddingBottom = 4, maxWidth = 100 }: TextBlockProps) => {
  const customBg = bgType === 'custom' && bgColor ? { backgroundColor: bgColor } : {};
  const bgClassGrid = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : '');
  const borderClassGrid = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : (bgType === 'custom' ? 'border border-gray-100 shadow-sm' : '');
  const paddingClass = bgType === 'custom' || bgType === 'white' ? 'px-8 md:px-12' : 'px-4';

  return (
    <div 
      className={`w-full my-2 rounded-theme relative overflow-hidden mx-auto ${bgClassGrid} ${borderClassGrid} ${paddingClass}`} 
      style={{ ...customBg, paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem`, maxWidth: `${maxWidth}%` }}
    >
      {/* Decorative gradient blob */}
      {showDecoration && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary blur-[100px] opacity-15 pointer-events-none z-0"></div>
      )}

      <div className={`text-${alignment} relative z-10`}>
        {title && (
          <h2 
            className="text-3xl font-bold text-gray-900 mb-6"
            dangerouslySetInnerHTML={parseRichText(title)}
          />
        )}
        <div 
          className="prose max-w-none text-gray-600 text-lg leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={parseRichText(content || "Hier ist Platz für deinen Fließtext. Beschreibe detailliert einen Aspekt deines Unternehmens, erkläre ein Produkt oder teile einfach Informationen mit deinen Besuchern. Dieser Block ++passt sich++ an die Textmenge an.")}
        />
      </div>
    </div>
  );
};
