export interface BrochureTemplate {
  id: string;
  name: string;
  tagline: string;
  preview: {
    bg: string;
    primary: string;
    accent: string;
    text: string;
    gradient?: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
    cardBg: string;
    mutedText: string;
    heroGradient: string; // CSS gradient string for hero
  };
  style: {
    rounded: string;
    headerStyle: 'gradient' | 'solid' | 'split';
    cardStyle: 'flat' | 'elevated' | 'glass' | 'outlined';
    pattern: 'none' | 'dots' | 'diagonal' | 'geometric' | 'noise';
  };
  font: {
    heading: string;
    body: string;
  };
}

export const TEMPLATES: BrochureTemplate[] = [
  {
    id: 'lumiere',
    name: 'Lumière',
    tagline: 'Ultra Premium',
    preview: { bg: '#1A1A2E', primary: '#C9A84C', accent: '#F5E6C8', text: '#F5E6C8', gradient: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 100%)' },
    colors: {
      primary: '#C9A84C',
      secondary: '#A07830',
      accent: '#F5E6C8',
      bg: '#1A1A2E',
      text: '#F5E6C8',
      cardBg: '#252540',
      mutedText: '#A09880',
      heroGradient: 'linear-gradient(145deg, #0D0D1E 0%, #1A1A2E 40%, #2A2040 100%)',
    },
    style: {
      rounded: 'rounded-xl',
      headerStyle: 'gradient',
      cardStyle: 'glass',
      pattern: 'none',
    },
    font: { heading: 'Georgia, "Times New Roman", serif', body: 'Georgia, serif' },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    tagline: 'Vibrant Gradient',
    preview: { bg: '#0F0C29', primary: '#A855F7', accent: '#06B6D4', text: '#FFFFFF', gradient: 'linear-gradient(135deg, #0F0C29, #302B63, #24243e)' },
    colors: {
      primary: '#A855F7',
      secondary: '#06B6D4',
      accent: '#F472B6',
      bg: '#0F0C29',
      text: '#FFFFFF',
      cardBg: '#1A1740',
      mutedText: '#A78BCA',
      heroGradient: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
    },
    style: {
      rounded: 'rounded-2xl',
      headerStyle: 'gradient',
      cardStyle: 'glass',
      pattern: 'geometric',
    },
    font: { heading: '"Arial Black", Helvetica, sans-serif', body: 'Helvetica, Arial, sans-serif' },
  },
  {
    id: 'soleil',
    name: 'Soleil',
    tagline: 'Mediterranean Luxury',
    preview: { bg: '#FDF6EC', primary: '#C2762A', accent: '#E8B86D', text: '#2C1810', gradient: 'linear-gradient(135deg, #C2762A, #E8B86D)' },
    colors: {
      primary: '#C2762A',
      secondary: '#E8B86D',
      accent: '#F5D5A0',
      bg: '#FDF6EC',
      text: '#2C1810',
      cardBg: '#FFF8F0',
      mutedText: '#8B6040',
      heroGradient: 'linear-gradient(145deg, #8B4513 0%, #C2762A 50%, #E8B86D 100%)',
    },
    style: {
      rounded: 'rounded-xl',
      headerStyle: 'gradient',
      cardStyle: 'elevated',
      pattern: 'none',
    },
    font: { heading: 'Georgia, "Times New Roman", serif', body: 'Helvetica, Arial, sans-serif' },
  },
  {
    id: 'frost',
    name: 'Frost',
    tagline: 'Premium Athletic',
    preview: { bg: '#F0F7FF', primary: '#0369A1', accent: '#38BDF8', text: '#0C2340', gradient: 'linear-gradient(135deg, #0369A1, #0EA5E9)' },
    colors: {
      primary: '#0369A1',
      secondary: '#0EA5E9',
      accent: '#38BDF8',
      bg: '#F0F7FF',
      text: '#0C2340',
      cardBg: '#FFFFFF',
      mutedText: '#4A7090',
      heroGradient: 'linear-gradient(145deg, #0C2340 0%, #0369A1 60%, #0EA5E9 100%)',
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
    id: 'ember',
    name: 'Ember',
    tagline: 'Sophisticated Energy',
    preview: { bg: '#1A0A00', primary: '#DC2626', accent: '#F97316', text: '#FEF3C7', gradient: 'linear-gradient(135deg, #7F1D1D, #DC2626, #F97316)' },
    colors: {
      primary: '#DC2626',
      secondary: '#F97316',
      accent: '#FEF3C7',
      bg: '#1A0A00',
      text: '#FEF3C7',
      cardBg: '#2A1200',
      mutedText: '#D0905A',
      heroGradient: 'linear-gradient(145deg, #1A0A00 0%, #7F1D1D 40%, #DC2626 100%)',
    },
    style: {
      rounded: 'rounded-xl',
      headerStyle: 'gradient',
      cardStyle: 'glass',
      pattern: 'diagonal',
    },
    font: { heading: 'Impact, "Arial Black", sans-serif', body: 'Arial, sans-serif' },
  },
  {
    id: 'verdant',
    name: 'Verdant',
    tagline: 'Modern Wellness',
    preview: { bg: '#F7F9F4', primary: '#166534', accent: '#86EFAC', text: '#14532D', gradient: 'linear-gradient(135deg, #14532D, #166534)' },
    colors: {
      primary: '#166534',
      secondary: '#15803D',
      accent: '#86EFAC',
      bg: '#F7F9F4',
      text: '#14532D',
      cardBg: '#FFFFFF',
      mutedText: '#4A7A5A',
      heroGradient: 'linear-gradient(145deg, #052E16 0%, #166534 50%, #15803D 100%)',
    },
    style: {
      rounded: 'rounded-2xl',
      headerStyle: 'gradient',
      cardStyle: 'elevated',
      pattern: 'none',
    },
    font: { heading: 'Georgia, "Times New Roman", serif', body: 'Helvetica, Arial, sans-serif' },
  },
  {
    id: 'noir',
    name: 'Noir',
    tagline: 'Ultra Editorial',
    preview: { bg: '#FFFFFF', primary: '#111111', accent: '#E11D48', text: '#111111', gradient: 'linear-gradient(135deg, #111111, #333333)' },
    colors: {
      primary: '#111111',
      secondary: '#333333',
      accent: '#E11D48',
      bg: '#FFFFFF',
      text: '#111111',
      cardBg: '#F9F9F9',
      mutedText: '#555555',
      heroGradient: 'linear-gradient(145deg, #000000 0%, #111111 50%, #1E1E1E 100%)',
    },
    style: {
      rounded: 'rounded-none',
      headerStyle: 'solid',
      cardStyle: 'outlined',
      pattern: 'none',
    },
    font: { heading: '"Arial Black", "Helvetica Neue", sans-serif', body: '"Helvetica Neue", Helvetica, sans-serif' },
  },
  {
    id: 'prism',
    name: 'Prism',
    tagline: 'Contemporary Bold',
    preview: { bg: '#FAFAFA', primary: '#7C3AED', accent: '#EC4899', text: '#1E1B4B', gradient: 'linear-gradient(135deg, #7C3AED, #EC4899, #F59E0B)' },
    colors: {
      primary: '#7C3AED',
      secondary: '#A855F7',
      accent: '#EC4899',
      bg: '#FAFAFA',
      text: '#1E1B4B',
      cardBg: '#FFFFFF',
      mutedText: '#6B7280',
      heroGradient: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 40%, #EC4899 100%)',
    },
    style: {
      rounded: 'rounded-2xl',
      headerStyle: 'gradient',
      cardStyle: 'elevated',
      pattern: 'none',
    },
    font: { heading: '"Arial Black", Helvetica, sans-serif', body: 'Helvetica, Arial, sans-serif' },
  },
  {
    id: 'coral',
    name: 'Coral',
    tagline: 'Modern Coastal',
    preview: { bg: '#FFF5F0', primary: '#E8603C', accent: '#FBBF24', text: '#2D1B14', gradient: 'linear-gradient(135deg, #E8603C, #F59E0B)' },
    colors: {
      primary: '#E8603C',
      secondary: '#F59E0B',
      accent: '#FDE68A',
      bg: '#FFF5F0',
      text: '#2D1B14',
      cardBg: '#FFFFFF',
      mutedText: '#8B5A4A',
      heroGradient: 'linear-gradient(145deg, #9A2F1C 0%, #E8603C 60%, #F59E0B 100%)',
    },
    style: {
      rounded: 'rounded-xl',
      headerStyle: 'gradient',
      cardStyle: 'elevated',
      pattern: 'none',
    },
    font: { heading: '"Trebuchet MS", Verdana, sans-serif', body: 'Verdana, sans-serif' },
  },
  {
    id: 'cipher',
    name: 'Cipher',
    tagline: 'Dark Tech',
    preview: { bg: '#030712', primary: '#6EE7B7', accent: '#818CF8', text: '#E2E8F0', gradient: 'linear-gradient(135deg, #030712, #0F172A)' },
    colors: {
      primary: '#6EE7B7',
      secondary: '#818CF8',
      accent: '#F472B6',
      bg: '#030712',
      text: '#E2E8F0',
      cardBg: '#0F172A',
      mutedText: '#64748B',
      heroGradient: 'linear-gradient(145deg, #000000 0%, #030712 50%, #0F172A 100%)',
    },
    style: {
      rounded: 'rounded-xl',
      headerStyle: 'gradient',
      cardStyle: 'glass',
      pattern: 'geometric',
    },
    font: { heading: '"Courier New", Courier, monospace', body: '"Courier New", Courier, monospace' },
  },
];

export function getTemplate(id: string): BrochureTemplate {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}
