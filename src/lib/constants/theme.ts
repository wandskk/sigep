/**
 * Constantes de tema para toda a aplicação
 */

/**
 * Cores principais do tema
 */
export const COLORS = {
  // Cores principais
  primary: {
    main: '#1E3A8A', // Azul profundo - botões principais, navbar e destaques
    light: '#3151A6',
    dark: '#15286D',
    contrast: '#FFFFFF',
  },
  
  secondary: {
    main: '#10B981', // Verde médio - confirmações, aprovações, progresso
    light: '#34D399',
    dark: '#059669',
    contrast: '#FFFFFF',
  },
  
  // Cores neutras
  neutral: {
    light: '#F3F4F6', // Cinza claro - background geral ou seções claras
    medium: '#D1D5DB',
    dark: '#374151', // Cinza escuro - texto principal
  },
  
  // Cores de estado
  state: {
    warning: '#FBBF24', // Amarelo suave - alertas e chamadas de atenção
    error: '#EF4444', // Vermelho suave - mensagens de erro/validação
    info: '#60A5FA',
    success: '#10B981',
  },
  
  // Cores comuns
  common: {
    white: '#FFFFFF',
    black: '#000000',
  },
};

/**
 * Tamanhos padrão de bordas arredondadas
 */
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',
  md: '0.25rem',
  lg: '0.5rem',
  xl: '1rem',
  full: '9999px',
};

/**
 * Configuração de sombras
 */
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

/**
 * Espaçamentos padrão
 */
export const SPACING = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
};

/**
 * Configuração de tipografia
 */
export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
}; 