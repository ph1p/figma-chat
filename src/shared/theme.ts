const darkTheme = {
  fontColor: "#fff",
  secondaryFontColor: "#615e73",
  thirdFontColor: "#606d80",
  fontColorInverse: "#000",
  backgroundColor: '#0D0B1C',
  secondaryBackgroundColor: '#1F2538',
  backgroundColorInverse: '#E7E7E7',
  borderColor: '#272D36',
  tooltipBackgroundColor: '#fff',
  placeholder: '#626E81',
};

const theme = {
  fontColor: "#000",
  secondaryFontColor: "#cecece",
  thirdFontColor: "#A2ADC0",
  fontColorInverse: "#fff",
  backgroundColor: '#fff',
  secondaryBackgroundColor: '#eceff4',
  backgroundColorInverse: '#383168',
  borderColor: '#e4e4e4',
  tooltipBackgroundColor: '#1e1940',
  placeholder: '#a2adc0',
};

export default (isDarkTheme) => isDarkTheme ? darkTheme : theme;