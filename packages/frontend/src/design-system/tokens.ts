export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
} as const;

export const radius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type Breakpoint = keyof typeof breakpoints;
