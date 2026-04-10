import { Film } from 'lucide-react';
import { parseRichText } from '../../../utils/textParser';

interface VideoBlockProps {
  url?: string;
  title?: string;
  text?: string;
  autoPlay?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
}

export const VideoBlock = ({ url, title, text, autoPlay = true, paddingTop = 4, paddingBottom = 4, maxWidth = 100 }: VideoBlockProps) => {
  return (
    <div className="w-full px-4 flex flex-col items-center mx-auto" style={{ paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem`, maxWidth: `${maxWidth}%` }}>
      <div className="max-w-4xl w-full text-center mb-8">
        {title && <h2 className="text-3xl font-bold mb-4" dangerouslySetInnerHTML={parseRichText(title)} />}
        {text && <p className="text-lg text-gray-600 max-w-2xl mx-auto" dangerouslySetInnerHTML={parseRichText(text)} />}
      </div>
      
      {url ? (
        <figure className="max-w-4xl w-full">
          <video 
            src={url} 
            controls 
            autoPlay={autoPlay} 
            muted={autoPlay} 
            loop={autoPlay}
            className="w-full h-auto rounded-theme shadow-xl object-cover bg-black"
          />
        </figure>
      ) : (
        <div className="w-full max-w-4xl aspect-[16/9] bg-gray-100 rounded-theme border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
          <Film size={48} className="mb-4 opacity-50" />
          <p className="font-medium">Kein Video ausgewählt</p>
          <p className="text-sm mt-1">Klicke diesen Block an, um in der Sidebar ein Video zu hinterlegen (.mp4 / url).</p>
        </div>
      )}
    </div>
  );
};
