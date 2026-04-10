import { HeroBlock } from './HeroBlock';
import { TextBlock } from './TextBlock';
import { ImageBlock } from './ImageBlock';
import { ButtonBlock } from './ButtonBlock';
import { NavbarBlock } from './NavbarBlock';
import { FeaturesGridBlock } from './FeaturesGridBlock';
import { SplitBlock } from './SplitBlock';
import { VideoBlock } from './VideoBlock';
import { AvatarGridBlock } from './AvatarGridBlock';
import { CarouselBlock } from './CarouselBlock';
import { LeadCaptureBlock } from './LeadCaptureBlock';
import { PricingBlock } from './PricingBlock';
import { FaqBlock } from './FaqBlock';
import { TestimonialBlock } from './TestimonialBlock';
import type { Block } from '../../../types';

interface Props {
  block: Block;
}

export const BlockRenderer = ({ block }: Props) => {
  switch (block.type) {
    case 'NavbarBlock':
      return <NavbarBlock {...block.props} />;
    case 'HeroSection':
      return <HeroBlock {...block.props} />;
    case 'TextBlock':
      return <TextBlock {...block.props} />;
    case 'ImageBlock':
      return <ImageBlock {...block.props} />;
    case 'ButtonBlock':
      return <ButtonBlock {...block.props} />;
    case 'FeaturesGridBlock':
      return <FeaturesGridBlock {...block.props} />;
    case 'SplitBlock':
      return <SplitBlock {...block.props} />;
    case 'VideoBlock':
      return <VideoBlock {...block.props} />;
    case 'AvatarGridBlock':
      return <AvatarGridBlock {...block.props} />;
    case 'CarouselBlock':
      return <CarouselBlock {...block.props} />;
    case 'LeadCaptureBlock':
      return <LeadCaptureBlock {...block.props} />;
    case 'PricingBlock':
      return <PricingBlock {...block.props} />;
    case 'FaqBlock':
      return <FaqBlock {...block.props} />;
    case 'TestimonialBlock':
      return <TestimonialBlock {...block.props} />;
    default:
      return <div className="p-4 bg-red-50 text-red-500 rounded border border-red-200">Unbekannter Block-Typ: {block.type}</div>;
  }
};
