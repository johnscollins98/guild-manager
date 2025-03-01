import { CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import MuiThemeProvider from '@mui/material/styles/ThemeProvider';
import { type PropsWithChildren } from 'react';

const theme = createTheme({
  colorSchemes: {
    dark: true,
    light: true
  },
  cssVariables: {
    colorSchemeSelector: 'class'
  },
  typography: {
    fontFamily: ['"lato"', 'sans-serif'].join(',')
  },

  components: {
    MuiDialogContent: {
      styleOverrides: { root: { paddingTop: `8px !important` } }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    },
    MuiDialog: {
      defaultProps: {
        PaperProps: {
          elevation: 0
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      }
    },
    MuiList: {
      defaultProps: {
        dense: true
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default,
          border: `1px solid ${theme.palette.divider}`
        })
      }
    }
  }
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <MuiThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
