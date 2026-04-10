import { Users } from 'lucide-react';
import { parseRichText } from '../../../utils/textParser';

interface AvatarProps {
  avatarUrl?: string;
  name?: string;
  description?: string;
}

interface AvatarGridBlockProps {
  columns?: '2' | '3' | '4';
  f1?: AvatarProps;
  f2?: AvatarProps;
  f3?: AvatarProps;
  f4?: AvatarProps;
  bgColor?: string;
  noShadow?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
}

export const AvatarGridBlock = ({ 
  columns = '3', 
  f1, f2, f3, f4, 
  bgType = 'default', 
  bgColor, 
  noShadow = false,
  paddingTop = 4, paddingBottom = 4, maxWidth = 100
}: AvatarGridBlockProps) => {
  const colClass = columns === '2' ? 'md:grid-cols-2' : columns === '4' ? 'md:grid-cols-4' : 'md:grid-cols-3';
  
  const avatars = [
    f1 || { name: 'Max Mustermann', description: 'Gründer & CEO' },
    f2 || { name: 'Erika Musterfrau', description: 'Head of Design' },
    f3 || { name: 'John Doe', description: 'Lead Developer' },
    f4 || null
  ].filter(Boolean);

  const renderAvatars = avatars.slice(0, parseInt(columns));

  const customBg = bgType === 'custom' && bgColor ? { backgroundColor: bgColor } : {};
  const bgClassGrid = bgType === 'transparent' ? 'bg-transparent' : (bgType === 'custom' ? '' : 'bg-white');
  const borderClassGrid = noShadow || bgType === 'transparent' ? 'border-none shadow-none' : 'border border-gray-100 shadow-sm';

  return (
    <div className="w-full px-4 mx-auto" style={{ paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem`, maxWidth: `${maxWidth}%` }}>
      <div className={`grid grid-cols-1 gap-8 ${colClass}`}>
        {renderAvatars.map((avatar, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col items-center text-center p-8 rounded-theme ${bgClassGrid} ${borderClassGrid}`}
            style={customBg}
          >
            <div className="w-24 h-24 rounded-full overflow-hidden mb-6 bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
              {avatar?.avatarUrl ? (
                <img src={avatar.avatarUrl} alt={avatar.name} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-10 h-10 text-gray-400" />
              )}
            </div>
            {avatar?.name && <h4 className="text-xl font-bold mb-2" dangerouslySetInnerHTML={parseRichText(avatar.name)} />}
            {avatar?.description && <p className="text-gray-500 text-sm" dangerouslySetInnerHTML={parseRichText(avatar.description)} />}
          </div>
        ))}
      </div>
    </div>
  );
};
