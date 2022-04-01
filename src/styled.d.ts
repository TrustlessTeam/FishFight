import 'styled-components';

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    borderRadius: string;

    spacing: {
      gapSmall: string;
      gap: string;
      gapMedium: string;
      gapLarge: string;
    }

    colors: {
      color1: string;
      color2: string;
      color3: string;
      color4: string;
      color5: string;
      color6: string;
      color7: string;
      color8: string;
      color9: string;

      gradientTop: string;
      gradientRight: string;
      gradientBottom: string;
      gradientLeft: string;
      gradientTopRight: string;
      gradientBottomRight: string;
      gradientTopLeft: string;
      gradientBottomLeft: string;
      gradientRadial: string;
    };

    device: {
      mobileS: string;
      mobileM: string;
      mobileL: string;
      tablet: string;
      laptop: string;
      laptopL: string;
      desktop: string;
      desktopL: string;
    };

    font: {
      xsmall: string;
      small: string;
      normal: string;
      medium: string;
      large: string;
    }
  }
}