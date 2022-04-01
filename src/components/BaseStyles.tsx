import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Modal from 'react-modal';
import iceImg from "../img/ice.jpg";
import bloodImg from "../img/blood.png";
import waterImg from "../img/water.jpg";

export const ContainerRow = styled.div`
	position: relative;
	display: flex;
	flex-flow: row nowrap;
	padding: ${props => props.theme.spacing.gap};
`;

export const ContainerColumn = styled.div`
	position: relative;
	display: flex;
	flex-flow: column;
	justify-content: center;
  align-items: center;
	padding: ${props => props.theme.spacing.gap};

	@media ${props => props.theme.device.tablet} {
		padding: ${props => props.theme.spacing.gapLarge};
  }
`;

export const Title = styled.h1`
	color: #61daff;
	font-size: ${props => props.theme.font.medium};
	margin: 0;
	padding-right: ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
		display: block;
	  font-size: ${props => props.theme.font.large};
  }
	/* text-decoration: underline; */
	text-transform: uppercase;

	span {
		color: white;
	}
`;

export const StyledModal = styled(Modal)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  /* min-width: fit-content; */
	/* max-width: 100%; */
	width: 100%;
  max-height: 100%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  background-color: rgba(4, 49, 83, 0.814);
	
	/* padding: ${props => props.theme.spacing.gap}; */
	box-shadow:  20px 20px 60px #254f67,
             -20px -20px 60px #336b8b;
  outline: none;
  overflow: hidden;
  z-index: 20;

	&::before {    
		content: "";
		/* background: url(${waterImg}); */
		/* background-blend-mode: lighten; */
		opacity: 0.9;
		border: solid white 2px;
		border-radius: 20px;
		background-size: cover;
		position: absolute;
		top: 0px;
		right: 0px;
		bottom: 0px;
		left: 0px;
	}

	@media ${props => props.theme.device.tablet} {
		max-width: 800px;
  }
`;

export const BaseContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	width: 100%;
	height: 100%;
`;

export const BaseContainerCentered = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	/* pointer-events: auto; */
`;

export const ContainerControls = styled.div`
	position: relative;
	display: flex;
	flex-flow: row nowrap;
	padding: ${props => props.theme.spacing.gapSmall};
	/* height: 17%; */
	pointer-events: auto;
	justify-content: space-between;
`;

export const OptionsContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
`;

export const UIContainer = styled.div`
	display: flex;
	flex-flow: column;
	justify-content: center;
	align-items: center;
	background-color: rgba(255,255,255,0.8);
	padding: ${props => props.theme.spacing.gap};
	border-radius: 25px;
	pointer-events: auto;
`;

export const Error = styled.div`
	background-color: #8f0000;
	padding: ${props => props.theme.spacing.gap};
	border-radius: 10px;
	box-shadow:  10px 10px 30px #6e004d,
             -10px -10px 30px #910d14;

	p {
		font-size: ${props => props.theme.font.medium};
	}
`

export const BaseText = styled.p`
	display: flex;
	flex-flow: column;
	justify-content: center;
	margin: 0;
	color: white;

	font-size: ${props => props.theme.font.small};

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
  }
`;

export const BaseTitle = styled.p`
	display: flex;
	flex-flow: column;
	justify-content: center;
	align-items: center;
	padding: ${props => props.theme.spacing.gap};
	margin: 0;
	color: white;
	font-size: ${props => props.theme.font.medium};
	/* -webkit-text-stroke: 1px #61daff; */

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.large};
  }
`;

export const BaseButtonStyle = styled.button`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	position: relative;
  border-radius: 10px;
  border: none;
  color: black;

  text-align: center;
  padding: 10px 20px;
	font-size: ${props => props.theme.font.small};
  text-decoration: none;
  text-transform: uppercase;
	cursor: pointer;
  background-image: linear-gradient(#ffffff, #adadad);
  z-index: 1;
  box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .3), inset -2px -2px 2px rgba(0, 0, 0, .3);
  /* transition: transform 0.25s ease-in-out; */

  @media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
    /* padding: 12px 20px; */
  }



  &::before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 10px;
    background-image: linear-gradient(#ffffff, #e2e2e2);
    z-index: -1;
    transition: opacity 0.25s ease-in-out;
    opacity: 0;
  }
  
  &:hover::before {
    opacity: 1;
  }

	&:active {
		transform: scale(0.8);
	}
`;

export const BaseLinkButton = styled(Link)`
	display: flex;
	flex-flow: column;
	justify-content: center;
	padding: 0 1vmin;
	border-radius: 25px;
	background-color: white;
	border: none;
	opacity: 0.7;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.25);
	color: black;
	margin-top: 0;
	margin-bottom: 0;
	margin-left: ${props => props.theme.spacing.gapSmall};
	transition: opacity 0.3s ease, box-shadow 0.25s ease-in-out;
	text-transform: uppercase;
	font-weight: bolder;
	text-decoration: none;
	font-size: ${props => props.theme.font.small};

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
  }
`


