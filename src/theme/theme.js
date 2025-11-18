// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#81C784',
      light: '#A5D6A7',
      dark: '#519657',
    },
    accent: {
      main: '#00BFA5',
      light: '#64FFDA',
      dark: '#00796B',
    },
    background: {
      default: '#F1F8E9',
      paper: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)',
    },
    text: {
      primary: '#1A237E',
      secondary: '#424242',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F44336',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(46, 125, 50, 0.08)',
    '0px 4px 8px rgba(46, 125, 50, 0.08)',
    '0px 8px 16px rgba(46, 125, 50, 0.08)',
    '0px 16px 24px rgba(46, 125, 50, 0.08)',
    '0px 24px 32px rgba(46, 125, 50, 0.08)',
    '0px 32px 40px rgba(46, 125, 50, 0.12)',
    '0px 40px 48px rgba(46, 125, 50, 0.12)',
    '0px 48px 56px rgba(46, 125, 50, 0.16)',
    '0px 56px 64px rgba(46, 125, 50, 0.16)',
    '0px 64px 72px rgba(46, 125, 50, 0.20)',
    '0px 72px 80px rgba(46, 125, 50, 0.20)',
    '0px 80px 88px rgba(46, 125, 50, 0.24)',
    '0px 88px 96px rgba(46, 125, 50, 0.24)',
    '0px 96px 104px rgba(46, 125, 50, 0.28)',
    '0px 104px 112px rgba(46, 125, 50, 0.28)',
    '0px 112px 120px rgba(46, 125, 50, 0.32)',
    '0px 120px 128px rgba(46, 125, 50, 0.32)',
    '0px 128px 136px rgba(46, 125, 50, 0.36)',
    '0px 136px 144px rgba(46, 125, 50, 0.36)',
    '0px 144px 152px rgba(46, 125, 50, 0.40)',
    '0px 152px 160px rgba(46, 125, 50, 0.40)',
    '0px 160px 168px rgba(46, 125, 50, 0.44)',
    '0px 168px 176px rgba(46, 125, 50, 0.44)',
    '0px 176px 184px rgba(46, 125, 50, 0.48)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: '12px 32px',
          fontSize: '1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(46, 125, 50, 0.25)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)',
          boxShadow: '0 4px 16px rgba(46, 125, 50, 0.2)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 40px rgba(46, 125, 50, 0.15)',
          },
        },
      },
    },
  },
});

export default theme;