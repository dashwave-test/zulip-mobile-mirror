// @flow strict-local
// Custom theme file

const themeData = {
  light: {
    backgroundColor: '#ffffff',
    color: '#000000',
    statusBarColor: '#ffffff', // New statusBarColor property for light theme
  },
  dark: {
    backgroundColor: '#000000',
    color: '#ffffff',
    statusBarColor: '#000000', // New statusBarColor property for dark theme
  },
};

const ThemeContext = React.createContext(themeData.light);

export { themeData, ThemeContext };
