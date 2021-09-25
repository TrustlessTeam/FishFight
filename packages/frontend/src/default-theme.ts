import { DefaultTheme } from 'styled-components';

const navyBlue = 'rgba(3, 4, 94, 1)';
const darkCornflowerBlue =  'rgba(2, 62, 138, 1)';
const starCommandBlue = 'rgba(0, 119, 182, 1)';
const blueGreen = 'rgba(0, 150, 199, 1)';
const ceruleanCrayola = 'rgba(0, 180, 216, 1)';
const skyBlueCrayola = 'rgba(72, 202, 228, 1)';
const skyBlueCrayola2 = 'rgba(144, 224, 239, 1)';
const blizzardBlue = 'rgba(173, 232, 244, 1)';
const powderBlue = 'rgba(202, 240, 248, 1)';

const gradientTop = `linear-gradient(0deg, ${navyBlue}, ${darkCornflowerBlue}, ${starCommandBlue}, ${blueGreen}, ${ceruleanCrayola}, ${skyBlueCrayola}, ${skyBlueCrayola2}, ${blizzardBlue}, ${powderBlue});`;
const gradientRight = `linear-gradient(90deg, ${navyBlue}, ${darkCornflowerBlue}, ${starCommandBlue}, ${blueGreen}, ${ceruleanCrayola}, ${skyBlueCrayola}, ${skyBlueCrayola2}, ${blizzardBlue}, ${powderBlue});`;
const gradientBottom = `linear-gradient(180deg, ${navyBlue}, ${darkCornflowerBlue}, ${starCommandBlue}, ${blueGreen}, ${ceruleanCrayola}, ${skyBlueCrayola}, ${skyBlueCrayola2}, ${blizzardBlue}, ${powderBlue});`;
const gradientLeft = `linear-gradient(270deg, ${navyBlue}, ${darkCornflowerBlue}, ${starCommandBlue}, ${blueGreen}, ${ceruleanCrayola}, ${skyBlueCrayola}, ${skyBlueCrayola2}, ${blizzardBlue}, ${powderBlue});`;
const gradientTopRight = `linear-gradient(45deg, ${navyBlue}, ${darkCornflowerBlue}, ${starCommandBlue}, ${blueGreen}, ${ceruleanCrayola}, ${skyBlueCrayola}, ${skyBlueCrayola2}, ${blizzardBlue}, ${powderBlue});`;
const gradientBottomRight = `linear-gradient(135deg, ${navyBlue}, ${darkCornflowerBlue}, ${starCommandBlue}, ${blueGreen}, ${ceruleanCrayola}, ${skyBlueCrayola}, ${skyBlueCrayola2}, ${blizzardBlue}, ${powderBlue});`;
const gradientTopLeft = `linear-gradient(225deg, ${navyBlue}, ${darkCornflowerBlue}, ${starCommandBlue}, ${blueGreen}, ${ceruleanCrayola}, ${skyBlueCrayola}, ${skyBlueCrayola2}, ${blizzardBlue}, ${powderBlue});`;
const gradientBottomLeft = `linear-gradient(315deg, ${navyBlue}, ${darkCornflowerBlue}, ${starCommandBlue}, ${blueGreen}, ${ceruleanCrayola}, ${skyBlueCrayola}, ${skyBlueCrayola2}, ${blizzardBlue}, ${powderBlue});`;
const gradientRadial = `radial-gradient(${navyBlue}, ${darkCornflowerBlue}, ${starCommandBlue}, ${blueGreen}, ${ceruleanCrayola}, ${skyBlueCrayola}, ${skyBlueCrayola2}, ${blizzardBlue}, ${powderBlue});`;

const spacingBase = 10;
const gapSmall = spacingBase / 2 + `px`;
const gap = spacingBase + `px`;
const gapMedium = spacingBase * 2 + `px`;
const gapLarge = spacingBase * 3 + `px`

const size = {
  mobileS: '320px',
  mobileM: '375px',
  mobileL: '425px',
  tablet: '768px',
  laptop: '1024px',
  laptopL: '1440px',
  desktop: '2560px'
}

const device = {
  mobileS: `(min-width: ${size.mobileS})`,
  mobileM: `(min-width: ${size.mobileM})`,
  mobileL: `(min-width: ${size.mobileL})`,
  tablet: `(min-width: ${size.tablet})`,
  laptop: `(min-width: ${size.laptop})`,
  laptopL: `(min-width: ${size.laptopL})`,
  desktop: `(min-width: ${size.desktop})`,
  desktopL: `(min-width: ${size.desktop})`
};


const BaseTheme: DefaultTheme = {
  borderRadius: '5px',
  spacing: {
    gapSmall: gapSmall,
    gap: gap,
    gapMedium: gapMedium,
    gapLarge: gapLarge
  },
  colors: {
    color1: navyBlue,
    color2: darkCornflowerBlue,
    color3: starCommandBlue,
    color4: blueGreen,
    color5: ceruleanCrayola,
    color6: skyBlueCrayola,
    color7: skyBlueCrayola2,
    color8: blizzardBlue,
    color9: powderBlue,

    gradientTop: gradientTop,
    gradientRight: gradientRight,
    gradientBottom: gradientBottom,
    gradientLeft: gradientLeft,
    gradientTopRight: gradientTopRight,
    gradientBottomRight: gradientBottomRight,
    gradientTopLeft: gradientTopLeft,
    gradientBottomLeft: gradientBottomLeft,
    gradientRadial: gradientRadial,
  },
  device: {
    mobileS: device.mobileS,
    mobileM: device.mobileM,
    mobileL: device.mobileL,
    tablet: device.tablet,
    laptop: device.laptop,
    laptopL: device.laptopL,
    desktop: device.desktop,
    desktopL: device.desktopL
  }
};

export { BaseTheme };