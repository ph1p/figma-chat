// styled.d.t.s

import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    fontColor: string;
    secondaryFontColor: string;
    thirdFontColor: string;
    fontColorInverse: string;
    backgroundColor: string;
    secondaryBackgroundColor: string;
    backgroundColorInverse: string;
    scrollbarColor: string;
    borderColor: string;
    tooltipBackgroundColor: string;
    placeholder: string;
    brighterInputFont: string;
    tooltipShadow: string;
  }
}
