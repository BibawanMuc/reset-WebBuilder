export interface Block {
  id: string;
  type: string; // e.g. 'Hero', 'Text', 'Image'
  props: Record<string, any>;
}

export interface Page {
  id: string;
  name: string;
  route: string;
  blocks: Block[];
}

export interface ProjectTheme {
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
  backgroundColor2?: string; // For gradient
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundOpacity?: number;
  borderRadius?: string;
  showScrollToTop?: boolean;
  enableAnimations?: boolean;
  enableDarkMode?: boolean;
}

export interface ProjectConfig {
  font: string;
  toolbarType: string;
  logo: string | null;
  theme?: ProjectTheme;
  impressumText?: string;
  privacyText?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  config: ProjectConfig;
  pages: Page[];
}

export interface ProjectOverview {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
