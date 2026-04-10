import { useState, useRef, useEffect } from 'react';
import { GalleryHorizontal, Image as ImageIcon } from 'lucide-react';
import { parseRichText } from '../../../utils/textParser';

interface SlideProps {
  image?: string;
  title?: string;
  description?: string;
}

interface CarouselBlockProps {
  slidesCount?: '3' | '4' | '5' | '6';
  s1?: SlideProps;
  s2?: SlideProps;
  s3?: SlideProps;
  s4?: SlideProps;
  s6?: SlideProps;
  autoPlay?: boolean;
  aspectRatio?: '16/9' | '9/16' | '1/1' | 'mixed';
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
}

export const CarouselBlock = ({ 
  slidesCount = '3', 
  s1, s2, s3, s4, s5, s6,
  autoPlay = true,
  aspectRatio = 'mixed',
  paddingTop = 4, paddingBottom = 4, maxWidth = 100
}: CarouselBlockProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slidesRaw = [
    s1 || { title: 'Slide 1', description: 'Beispiel Beschreibung für Slide 1.' },
    s2 || { title: 'Slide 2', description: 'Beispiel Beschreibung für Slide 2.' },
    s3 || { title: 'Slide 3', description: 'Beispiel Beschreibung für Slide 3.' },
    s4 || null,
    s5 || null,
    s6 || null,
  ].filter(Boolean);

  const slides = slidesRaw.slice(0, parseInt(slidesCount));

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    
    // Auto-scroll logic for the React editor preview
    const interval = setInterval(() => {
      if (containerRef.current) {
        const nextIndex = (currentIndex + 1) % slides.length;
        const targetElement = containerRef.current.children[nextIndex] as HTMLElement;
        if (targetElement) {
          containerRef.current.scrollTo({
            left: targetElement.offsetLeft,
            behavior: 'smooth'
          });
          setCurrentIndex(nextIndex);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, autoPlay, slides.length]);

  return (
    <div className="w-full px-4 overflow-hidden relative group mx-auto" style={{ paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem`, maxWidth: `${maxWidth}%` }}>
      <div 
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 custom-scrollbar hide-scroll-bar focus:outline-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide, idx) => (
          <div 
            key={idx} 
            className="snap-center shrink-0 w-[85vw] md:w-[60vw] lg:w-[40vw] flex flex-col items-center bg-white border border-gray-100 rounded-theme shadow-sm overflow-hidden"
          >
            <div 
              className={`w-full flex items-center justify-center overflow-hidden relative bg-gray-50 ${aspectRatio === '16/9' ? 'aspect-video' : aspectRatio === '1/1' ? 'aspect-square' : aspectRatio === '9/16' ? 'aspect-[9/16]' : ''}`}
            >
              {slide?.image ? (
                <img 
                  src={slide.image} 
                  alt={slide.title || `Slide ${idx + 1}`} 
                  className={`w-full ${aspectRatio !== 'mixed' ? 'h-full object-cover' : 'h-auto max-h-[60vh] object-contain'}`} 
                />
              ) : (
                <div className="w-full aspect-[4/3] flex items-center justify-center"><GalleryHorizontal className="w-12 h-12 text-gray-300" /></div>
              )}
            </div>
            
            {(slide?.title || slide?.description) && (
              <div className="p-6 text-center w-full">
                {slide?.title && <h3 className="text-xl font-bold mb-2" dangerouslySetInnerHTML={parseRichText(slide.title)} />}
                {slide?.description && <p className="text-gray-500 text-sm" dangerouslySetInnerHTML={parseRichText(slide.description)} />}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <style>{`
        .hide-scroll-bar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
