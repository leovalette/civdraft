const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    ...defaultTheme,
    screens: {
      sm: '0px',
      md: '1360px',
      lg: '1580px',
      xl: '2160px',
    },
    colors: {
      ...defaultTheme.colors,
      background: '#2a5581',
      selection: '#0a3557',
      'hover-selection': '#022f52',
      'background-dark': '#062238',
      border: '#123344',
      'text-primary': '#bac4cb',
      team1: '#5e78a1',
      'hover-team1': '#588fed',
      team2: '#b88424',
      'hover-team2': '#b8090a',
      white: '#FFFFFF',
      black: '#000000',
      validation: '#038255',
      ready: '#8BE42C',
      'hover-validation': '#034939',
      'golden-border': '#c6a873',
      'bg-golden-border': '#5b4b30',
      'text-validation': '#cee5ee',
      blue: {
        ...colors.blue,
      },
      red: {
        ...colors.red,
      },
      gray: {
        ...colors.gray,
      },
      indigo: {
        ...colors.indigo,
      },
    },
  },
  plugins: [],
};
