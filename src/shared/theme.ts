const darkTheme = {
  fontColor: "#fff",
  secondaryFontColor: "#615e73",
  fontColorInverse: "#000",
  backgroundColor: '#0D0B1C',
  secondaryBackgroundColor: '#1F2538',
  borderColor: '#272D36',
  tooltipBackgroundColor: '#fff'
};

const theme = {
  fontColor: "#000",
  secondaryFontColor: "#cecece",
  fontColorInverse: "#fff",
  backgroundColor: '#fff',
  secondaryBackgroundColor: '#eceff4',
  borderColor: '#e4e4e4',
  tooltipBackgroundColor: '#1e1940'
};

export default (isDarkTheme) => isDarkTheme ? darkTheme : theme;