// Fix for styled-components v5 React 18 TypeScript compatibility
// This resolves TS2786 errors where styled components can't be used as JSX components

import 'react';

// Augment React types to be more lenient with JSX element compatibility
declare module 'react' {
  namespace React {
    // Make ReactElement more compatible with styled-components return types
    type ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> = {
      type: T;
      props: P;
      key: Key | null;
    };
  }
}

export {};

