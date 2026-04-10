import { useProjectStore } from '../../../store/useProjectStore';

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  image?: string;
  stars: number;
}

interface TestimonialBlockProps {
  headline?: string;
  subline?: string;
  testimonials?: string; // JSON string
  bgType?: string;
  bgColor?: string;
  noShadow?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
}

export const TestimonialBlock = (props: TestimonialBlockProps) => {
  const {
    headline = "Was unsere Kunden sagen",
    subline = "Schließe dich tausenden zufriedenen Nutzern an.",
    bgType = 'default',
    bgColor,
    noShadow = false,
    paddingTop = 4, paddingBottom = 4, maxWidth = 100
  } = props;

  let itemsList: TestimonialItem[] = [
    { quote: "Seit wir dieses Tool nutzen, hat sich unsere Produktivität verdoppelt. Einfach überragend!", author: "Sarah Müller", role: "CEO, TechFlow", stars: 5 },
    { quote: "Der Support ist blitzschnell und die Software unfassbar intuitiv. Eine absolute Empfehlung.", author: "Markus Schmidt", role: "Freelancer", stars: 5 },
    { quote: "Beste Entscheidung des Jahres. Hat uns extrem viel Zeit und Kopfschmerzen erspart.", author: "Julia Weber", role: "Projektleiterin", stars: 4 }
  ];

  try {
    if (props.testimonials) {
      itemsList = JSON.parse(props.testimonials);
    }
  } catch (e) {
    console.error("Failed to parse Testimonials");
  }

  const customBg = bgType === 'custom' && bgColor ? { backgroundColor: bgColor } : {};
  const bgClassGrid = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : 'bg-white');
  const borderClassGrid = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={i < count ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={i < count ? "text-yellow-400" : "text-gray-300"}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ));
  };

  return (
    <div className="w-full px-6 flex flex-col items-center mx-auto" style={{ paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem`, maxWidth: `${maxWidth}%` }}>
      <div className="text-center w-full mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{headline}</h2>
        <p className="text-lg text-gray-500">{subline}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {itemsList.map((item, i) => (
          <div key={i} className={`p-8 rounded-theme flex flex-col gap-6 ${bgClassGrid} ${borderClassGrid}`} style={customBg}>
            <div className="flex gap-1">
              {renderStars(item.stars)}
            </div>
            <p className="text-gray-700 italic leading-relaxed flex-1">"{item.quote}"</p>
            <div className="flex items-center gap-4 mt-2">
              {item.image ? (
                <img src={item.image} alt={item.author} className="w-12 h-12 rounded-full object-cover shadow-sm" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {item.author.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-bold text-gray-900">{item.author}</div>
                <div className="text-sm text-gray-500">{item.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
