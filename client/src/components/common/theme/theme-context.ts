import { type PaletteMode } from '@mui/material';
import { createContext, useContext } from 'react';

export interface ThemeContextType {
  theme: PaletteMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => console.log('toggle theme not provided')
});

export const useTheme = () => useContext(ThemeContext);
