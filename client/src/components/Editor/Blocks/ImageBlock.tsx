import { Image as ImageIcon } from 'lucide-react';

interface ImageBlockProps {
  url?: string;
  alt?: string;
  caption?: string;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
}

export const ImageBlock = ({ url, alt, caption, paddingTop = 8, paddingBottom = 8, maxWidth = 100 }: ImageBlockProps) => {
  return (
    <div className="w-full px-4 flex flex-col items-center mx-auto" style={{ paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem`, maxWidth: `${maxWidth}%` }}>
      {url ? (
        <figure className="w-full">
          <img 
            src={url} 
            alt={alt || "User hochgeladenes Bild"} 
            className="w-full h-auto rounded-theme shadow-xl object-cover"
          />
          {caption && (
            <figcaption className="mt-4 text-center text-sm text-gray-500">
              {caption}
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="w-full max-w-4xl aspect-[16/9] bg-gray-100 rounded-theme border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
          <ImageIcon size={48} className="mb-4 opacity-50" />
          <p className="font-medium">Kein Bild ausgewählt</p>
          <p className="text-sm mt-1">Klicke diesen Block an, um in der Sidebar ein Bild zu hinterlegen.</p>
        </div>
      )}
    </div>
  );
};
