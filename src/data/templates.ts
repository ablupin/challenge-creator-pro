export interface BrochureTemplate {
  id: string;
  name: string;
  tagline: string;
  preview: {
    bg: string;
    primary: string;
    accent: string;
    text: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
    cardBg: string;
    mutedText: string;
  };
  style: {
    rounded: string;
    headerStyle: 'gradient' | 'solid' | 'split';
    cardStyle: 'flat' | 'elevated' | 'glass' | 'outlined';
    pattern: 'none' | 'dots' | 'diagonal' | 'geometric';
  };
  font: {
    heading: string;
    body: string;
  };
}

export const TEMPLATES: BrochureTemplate[] = [
  {
    id: 'blaze',
    name: 'Blaze',
    tagline: 'Electric Energy',
    preview: { bg: '#FFF8F0', primary: '#FF4500', accent: '#FFD700', text: '#1A1A1A' },
    colors: {
      primary: '#FF4500',
      secondary: '#FF6B35',
      accent: '#FFD700',
      bg: '#FFF8F0',
      text: '#1A1A1A',
      cardBg: '#FFFFFF',
      mutedText: '#666666',
    },
    style: {
      rounded: 'rounded-none',
      headerStyle: 'gradient',
      cardStyle: 'elevated',
      pattern: 'none',
    },
    font: { heading: 'Impact, Arial Black, sans-serif', body: 'Arial, sans-serif' },
  },
  {
    id: 'marble',
    name: 'Marble',
    tagline: 'Clean Luxury',
    preview: { bg: '#FAFAF8', primary: '#8B7355', accent: '#D4AF37', text: '#2C2C2C' },
    colors: {
      primary: '#8B7355',
      secondary: '#C4A882',
      accent: '#D4AF37',
      bg: '#FAFAF8',
      text: '#2C2C2C',
      cardBg: '#F5F0E8',
      mutedText: '#7A7265',
    },
    style: {
      rounded: 'rounded-xl',
      headerStyle: 'solid',
      cardStyle: 'flat',
      pattern: 'none',
    },
    font: { heading: 'Georgia, "Times New Roman", serif', body: 'Georgia, serif' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Dark Power',
    preview: { bg: '#0D0D0D', primary: '#0080FF', accent: '#39FF14', text: '#F0F0F0' },
    colors: {
      primary: '#0080FF',
      secondary: '#00C8FF',
      accent: '#39FF14',
      bg: '#0D0D0D',
      text: '#F0F0F0',
      cardBg: '#1A1A2E',
      mutedText: '#9090A0',
    },
    style: {
      rounded: 'rounded-xl',
      headerStyle: 'gradient',
      cardStyle: 'glass',
      pattern: 'geometric',
    },
    font: { heading: '"Arial Black", Impact, sans-serif', body: 'Arial, sans-serif' },
  },
  {
    id: 'bloom',
    name: 'Bloom',
    tagline: 'Soft Wellness',
    preview: { bg: '#FAF8FC', primary: '#9B7FA6', accent: '#F9D4A0', text: '#3A3240' },
    colors: {
      primary: '#9B7FA6',
      secondary: '#7EC8A4',
      accent: '#F9D4A0',
      bg: '#FAF8FC',
      text: '#3A3240',
      cardBg: '#F0EBF4',
      mutedText: '#7A7090',
    },
    style: {
      rounded: 'rounded-3xl',
      headerStyle: 'gradient',
      cardStyle: 'flat',
      pattern: 'dots',
    },
    font: { heading: '"Trebuchet MS", Arial, sans-serif', body: '"Trebuchet MS", sans-serif' },
  },
  {
    id: 'metro',
    name: 'Metro',
    tagline: 'Bold Editorial',
    preview: { bg: '#FFFFFF', primary: '#E11D48', accent: '#E11D48', text: '#111111' },
    colors: {
      primary: '#E11D48',
      secondary: '#1C1C1C',
      accent: '#E11D48',
      bg: '#FFFFFF',
      text: '#111111',
      cardBg: '#F5F5F5',
      mutedText: '#555555',
    },
    style: {
      rounded: 'rounded-none',
      headerStyle: 'split',
      cardStyle: 'outlined',
      pattern: 'none',
    },
    font: { heading: '"Arial Black", Helvetica, sans-serif', body: 'Helvetica, Arial, sans-serif' },
  },
  {
    id: 'tropics',
    name: 'Tropics',
    tagline: 'Summer Vibes',
    preview: { bg: '#FFFBF0', primary: '#FF6B6B', accent: '#FFE66D', text: '#2D3436' },
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#FFE66D',
      bg: '#FFFBF0',
      text: '#2D3436',
      cardBg: '#FFFFFF',
      mutedText: '#636E72',
    },
    style: {
      rounded: 'rounded-xl',
      headerStyle: 'gradient',
      cardStyle: 'elevated',
      pattern: 'geometric',
    },
    font: { heading: '"Trebuchet MS", Verdana, sans-serif', body: 'Verdana, sans-serif' },
  },
  {
    id: 'crimson',
    name: 'Crimson',
    tagline: 'Athlete Fire',
    preview: { bg: '#FFF9F5', primary: '#9B1B1B', accent: '#F5DEB3', text: '#1A0A0A' },
    colors: {
      primary: '#9B1B1B',
      secondary: '#D4433A',
      accent: '#F5DEB3',
      bg: '#FFF9F5',
      text: '#1A0A0A',
      cardBg: '#FFFFFF',
      mutedText: '#6B3030',
    },
    style: {
      rounded: 'rounded-xl',
      headerStyle: 'solid',
      cardStyle: 'elevated',
      pattern: 'diagonal',
    },
    font: { heading: 'Impact, "Arial Black", sans-serif', body: 'Arial, sans-serif' },
  },
  {
    id: 'grove',
    name: 'Grove',
    tagline: 'Natural Health',
    preview: { bg: '#F8F6F0', primary: '#2D5016', accent: '#C8A951', text: '#1A2A10' },
    colors: {
      primary: '#2D5016',
      secondary: '#5A8C3C',
      accent: '#C8A951',
      bg: '#F8F6F0',
      text: '#1A2A10',
      cardBg: '#FFFFFF',
      mutedText: '#5A6B4A',
    },
    style: {
      rounded: 'rounded-xl',
      headerStyle: 'solid',
      cardStyle: 'flat',
      pattern: 'none',
    },
    font: { heading: 'Georgia, "Times New Roman", serif', body: 'Georgia, serif' },
  },
  {
    id: 'abyss',
    name: 'Abyss',
    tagline: 'Ocean Premium',
    preview: { bg: '#F0F8FF', primary: '#0A1628', accent: '#00D4FF', text: '#0A1628' },
    colors: {
      primary: '#0A1628',
      secondary: '#1E3A5F',
      accent: '#00D4FF',
      bg: '#F0F8FF',
      text: '#0A1628',
      cardBg: '#FFFFFF',
      mutedText: '#4A6080',
    },
    style: {
      rounded: 'rounded-xl',
      headerStyle: 'gradient',
      cardStyle: 'elevated',
      pattern: 'none',
    },
    font: { heading: '"Arial Black", Helvetica, sans-serif', body: 'Helvetica, Arial, sans-serif' },
  },
  {
    id: 'ink',
    name: 'Ink',
    tagline: 'Typographic',
    preview: { bg: '#FFFFFF', primary: '#111111', accent: '#111111', text: '#111111' },
    colors: {
      primary: '#111111',
      secondary: '#444444',
      accent: '#111111',
      bg: '#FFFFFF',
      text: '#111111',
      cardBg: '#F5F5F5',
      mutedText: '#777777',
    },
    style: {
      rounded: 'rounded-none',
      headerStyle: 'solid',
      cardStyle: 'outlined',
      pattern: 'none',
    },
    font: { heading: '"Arial Black", "Helvetica Neue", sans-serif', body: '"Helvetica Neue", Helvetica, sans-serif' },
  },
];

export function getTemplate(id: string): BrochureTemplate {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}
