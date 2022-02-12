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
	
`;

export const ApprovalsContainer = styled(LoadingOverlay)`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
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
	flex-flow: column;
	justify-content: center;
	padding: 1.2vmin 1.2vmin;
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
	font-size: ${props => props.theme.font.medium};

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
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
	font-size: ${props => props.theme.font.medium};

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`