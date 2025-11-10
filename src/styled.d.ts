import 'styled-components';
import { ReactElement } from 'react';

// Fix for React 18 compatibility with styled-components v5
declare module 'styled-components' {
  // Override the return type to fix React 18 JSX compatibility
  export interface StyledComponent<
    C extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
    T extends object,
    O extends object = {},
    A extends keyof any = never
  > extends React.ForwardRefExoticComponent<
      React.ComponentPropsWithRef<C> & O & { as?: C; forwardedAs?: C }
    > {
    (props: React.ComponentPropsWithRef<C> & O & { as?: C; forwardedAs?: C }): ReactElement;
  }

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