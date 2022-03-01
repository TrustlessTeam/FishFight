import { Link } from 'react-router-dom';
import styled from 'styled-components';
import LoadingOverlay from 'react-loading-overlay';


interface DefaultOptions {
	position?: string;
}

export const BaseOverlayContainer = styled(LoadingOverlay)`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	width: 100%;
	height: 100%;
	pointer-events: none;
`;

export const BaseContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
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

export const ApprovalsContainer = styled(LoadingOverlay)`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
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

export const ApprovalDisclaimer = styled.div`
	padding: ${props => props.theme.spacing.gap};
	margin-bottom: ${props => props.theme.spacing.gap};
	background-color: white;
	border-radius: 25px;
`;

export const BaseText = styled.p`
	display: flex;
	flex-flow: column;
	justify-content: center;
	padding: ${props => props.theme.spacing.gap};
	margin: 0;
	background-color: white;
	font-size: ${props => props.theme.font.large};
	border-radius: 25px;
	margin-left: ${props => props.theme.spacing.gapSmall};
`;

export const BaseButton = styled.button`
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

  background-image: linear-gradient(#ffffff, #adadad);
  z-index: 1;
  box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .3), inset -2px -2px 2px rgba(0, 0, 0, .3);
  /* transition: transform 0.25s ease-in-out; */

  @media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
    padding: 14px 24px;
  }

  &:hover {
		cursor: pointer;
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