import { Platform } from 'react-native';

export const COLORS = {
  // Warm paper canvas rather than the usual cool blue-gray.
  background: '#EDEAE3',
  card: '#FFFFFF',
  heading: '#191714',
  label: '#6E6862',
  placeholder: '#A39C93',
  border: '#191714',
  hairline: '#DCD7CD',

  // Vermillion carries every primary action; marigold is reserved for saved items.
  accent: '#E8452B',
  accentSoft: '#FDEDE9',
  marigold: '#F5B700',
  success: '#1E7A4C',
  danger: '#C0341D',

  // One tag colour per module, used only in small doses so the app still reads
  // as a single product rather than five unrelated ones.
  analytics: '#E8452B',
  lms: '#2364AA',
  chat: '#7D3C98',
  jobs: '#058C7E',
  projects: '#C2571A',
};

// Android ships genuinely condensed and black system faces, which gives the
// numerals real character without bundling any font files.
export const FONTS = Platform.select({
  android: { display: 'sans-serif-condensed', body: 'sans-serif' },
  ios: { display: 'System', body: 'System' },
  default: { display: 'system-ui, sans-serif', body: 'system-ui, sans-serif' },
});

export const TYPE = {
  display: {
    fontFamily: FONTS.display,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
    color: COLORS.heading,
  },
  cardTitle: {
    fontFamily: FONTS.display,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    color: COLORS.heading,
  },
  stat: {
    fontFamily: FONTS.display,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.7,
    color: COLORS.heading,
  },
  // The structural device: tiny, wide-tracked, uppercase.
  eyebrow: {
    fontFamily: FONTS.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: COLORS.label,
  },
  body: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.heading,
    lineHeight: 21,
  },
  meta: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.label,
  },
};

// Flat, hard-edged card: a real border instead of a blurred drop shadow.
export const cardStyle = {
  backgroundColor: COLORS.card,
  borderRadius: 6,
  borderWidth: 2,
  borderColor: COLORS.heading,
  padding: 16,
};

export const buttonStyle = {
  backgroundColor: COLORS.accent,
  borderRadius: 6,
  borderWidth: 2,
  borderColor: COLORS.heading,
  paddingVertical: 13,
  alignItems: 'center',
};

export const buttonTextStyle = {
  fontFamily: FONTS.display,
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '800',
  letterSpacing: 0.3,
};
