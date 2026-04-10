import { useProjectStore } from '../../../store/useProjectStore';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqBlockProps {
  headline?: string;
  subline?: string;
  faqs?: string; // JSON string of items array
  bgType?: string;
  bgColor?: string;
  noShadow?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
}

export const FaqBlock = (props: FaqBlockProps) => {
  const {
    headline = "Häufig gestellte Fragen",
    subline = "Hier findest du schnelle Antworten auf die wichtigsten Fragen.",
    bgType = 'default',
    bgColor,
    noShadow = false,
    paddingTop = 4, paddingBottom = 4, maxWidth = 100
  } = props;

  let faqsList: FaqItem[] = [
    { q: "Wie kann ich mein Abonnement kündigen?", a: "Du kannst dein Abonnement jederzeit in den Kontoeinstellungen unter 'Abrechnung' kündigen. Nach der Kündigung kannst du den Service noch bis zum Ende der laufenden Abrechnungsperiode nutzen." },
    { q: "Gibt es eine kostenlose Testphase?", a: "Ja, wir bieten eine 14-tägige kostenlose Testphase für alle neuen Nutzer an. Es ist keine Kreditkarte erforderlich." },
    { q: "Welche Zahlungsmethoden werden akzeptiert?", a: "Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, American Express) sowie PayPal und SEPA-Lastschrift." }
  ];

  try {
    if (props.faqs) {
      faqsList = JSON.parse(props.faqs);
    }
  } catch (e) {
    console.error("Failed to parse FAQs");
  }

  const customBg = bgType === 'custom' && bgColor ? { backgroundColor: bgColor } : {};
  const bgClassGrid = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : 'bg-white');
  const borderClassGrid = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';

  return (
    <div className="w-full px-6 flex flex-col items-center mx-auto" style={{ paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem`, maxWidth: `${maxWidth}%` }}>
      <div className="text-center w-full mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{headline}</h2>
        <p className="text-lg text-gray-500">{subline}</p>
      </div>

      <div className="w-full flex flex-col gap-4">
        {faqsList.map((item, i) => (
          <details key={i} className={`group ${bgClassGrid} ${borderClassGrid} rounded-theme overflow-hidden`} style={customBg}>
            <summary className="flex items-center justify-between p-6 font-bold text-gray-900 cursor-pointer list-none select-none">
              <span>{item.q}</span>
              <span className="transition group-open:rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};
