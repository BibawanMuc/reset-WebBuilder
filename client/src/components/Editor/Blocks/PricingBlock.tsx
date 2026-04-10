import { useProjectStore } from '../../../store/useProjectStore';

interface PricingBlockProps {
  headline?: string;
  subline?: string;
  tier1Name?: string;
  tier1Price?: string;
  tier1Features?: string;
  tier2Name?: string;
  tier2Price?: string;
  tier2Features?: string;
  tier2Highlight?: boolean;
  tier3Name?: string;
  tier3Price?: string;
  tier3Features?: string;
  bgType?: string;
  bgColor?: string;
  noShadow?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
}

export const PricingBlock = (props: PricingBlockProps) => {
  const {
    headline = "Einfache, transparente Preise",
    subline = "Wähle den Plan, der am besten zu deinem Unternehmen passt. Keine versteckten Kosten.",
    tier1Name = "Starter",
    tier1Price = "0€",
    tier1Features = "1 Benutzer, 5 Projekte, Basic Support",
    tier2Name = "Pro",
    tier2Price = "29€",
    tier2Features = "5 Benutzer, Unlimitierte Projekte, Priority Support",
    tier2Highlight = true,
    tier3Name = "Enterprise",
    tier3Price = "99€",
    tier3Features = "Unlimitierte Benutzer, Unlimitierte Projekte, 24/7 Phone Support",
    bgType = 'default',
    bgColor,
    noShadow = false,
    paddingTop = 4, paddingBottom = 4, maxWidth = 100
  } = props;

  const customBg = bgType === 'custom' && bgColor ? { backgroundColor: bgColor } : {};
  const bgClassGrid = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : 'bg-white');
  const borderClassGrid = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';

  const renderFeatures = (featuresList: string) => {
    return featuresList.split(',').map((feat) => feat.trim()).map((f, i) => (
      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"></polyline></svg>
        {f}
      </li>
    ));
  };

  return (
    <div className="w-full px-4 flex flex-col items-center mx-auto" style={{ paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem`, maxWidth: `${maxWidth}%` }}>
      <div className="text-center max-w-3xl mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{headline}</h2>
        <p className="text-lg text-gray-500">{subline}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {/* Tier 1 */}
        <div className={`p-8 rounded-theme flex flex-col ${bgClassGrid} ${borderClassGrid}`} style={customBg}>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{tier1Name}</h3>
          <div className="text-3xl font-extrabold text-gray-900 mb-6">{tier1Price}<span className="text-sm font-normal text-gray-500">/Monat</span></div>
          <ul className="mb-8 flex-1">
            {renderFeatures(tier1Features)}
          </ul>
          <button className="w-full py-3 px-4 border border-gray-200 text-gray-900 font-medium rounded-theme hover:border-primary transition-colors pointer-events-none">Starten</button>
        </div>

        {/* Tier 2 */}
        <div className={`p-8 rounded-theme flex flex-col relative ${bgClassGrid} ${tier2Highlight ? 'ring-2 ring-primary shadow-xl scale-105 z-10' : borderClassGrid}`} style={customBg}>
          {tier2Highlight && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full">
              Am beliebtesten
            </div>
          )}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{tier2Name}</h3>
          <div className="text-3xl font-extrabold text-gray-900 mb-6">{tier2Price}<span className="text-sm font-normal text-gray-500">/Monat</span></div>
          <ul className="mb-8 flex-1">
            {renderFeatures(tier2Features)}
          </ul>
          <button className="w-full py-3 px-4 bg-primary text-white font-medium rounded-theme hover:opacity-90 transition-opacity pointer-events-none">Starten</button>
        </div>

        {/* Tier 3 */}
        <div className={`p-8 rounded-theme flex flex-col ${bgClassGrid} ${borderClassGrid}`} style={customBg}>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{tier3Name}</h3>
          <div className="text-3xl font-extrabold text-gray-900 mb-6">{tier3Price}<span className="text-sm font-normal text-gray-500">/Monat</span></div>
          <ul className="mb-8 flex-1">
            {renderFeatures(tier3Features)}
          </ul>
          <button className="w-full py-3 px-4 border border-gray-200 text-gray-900 font-medium rounded-theme hover:border-primary transition-colors pointer-events-none">Konnktieren</button>
        </div>
      </div>
    </div>
  );
};
