const Theme = {
   colors: {
      primary: '#00D09C',
      secondary: '#7B61FF',
      background: '#121212',
      surface: '#1E1E1E',
      surfaceLight: '#2D2D2D',
      text: '#FFFFFF',
      textSecondary: '#A0A0A0',
      border: '#333333',
      error: '#FF5252',
      success: '#00C853',
      chart: {
         up: '#00C853',
         down: '#FF5252',
         volume: '#4A4A4A',
      },
   },
   spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
   },
   borderRadius: {
      small: '4px',
      medium: '8px',
      large: '12px',
   },
   shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.2)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.3)',
      large: '0 8px 16px rgba(0, 0, 0, 0.4)',
      glow: '0 0 8px rgba(0, 208, 156, 0.3)',
      neon: '0 0 12px',
   },
   transitions: {
      quick: 'all 0.2s ease',
      normal: 'all 0.3s ease',
      slow: 'all 0.5s ease',
   },
   typography: {
      fontSizes: {
         xs: '0.75rem',
         sm: '0.875rem',
         md: '1rem',
         lg: '1.25rem',
         xl: '1.5rem',
         xxl: '2rem',
         xxxl: '3rem',
      },
      fontWeights: {
         normal: 400,
         medium: 500,
         semibold: 600,
         bold: 700,
      },
   },
}

export default Theme
