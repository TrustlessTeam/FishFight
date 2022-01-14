
// React
import {
  NavLink,
	Outlet,
	Route,
	Routes
} from "react-router-dom";

// React web3
import { useWeb3React } from '@web3-react/core';
import { isMobile } from 'react-device-detect';


// React toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styled Components
import styled, { ThemeProvider } from 'styled-components';
import { BaseTheme } from '../default-theme';
import { slide as Menu } from 'react-burger-menu'

// Components
import Nav from './Nav';
import Account from './Account';
import Balance from './Balance';

import logo from '../src/img/FishFightLogo.png'
import infoImg from "../img/icons/info.svg"

import Blockchain from './BlockchainStatus';


import SeasonStatus from './SeasonStatus';
import UnityWindow from "./UnityWindow";
import FishingStatus from "./FishingStatus";
import FightingStatus from "./StatusModal";
import BreedingStatus from "./BreedingStatus";
import { useState } from "react";
import StatusModal from "./StatusModal";



const MenuOverlay = () => {
	const { account } = useWeb3React();
	const [open, setOpen] = useState(false);
	
	return (
		<Wrapper open={open}>
			<MenuContainer>
				{/* <LogoImg src={infoImg} open={open} onClick={() => setOpen(!open)}></LogoImg> */}
				<StatusModal/>
				<StyledNav></StyledNav>
				<User open={open}>
					<Account ></Account>
					{/* <Balance></Balance> */}
				</User>
				
				
				
				
				{/* <InfoContainer open={open}>
					
				</InfoContainer> */}
			</MenuContainer>
		</Wrapper>
	);
};

interface Props {
	open?: boolean;
}

const Wrapper = styled.div<{open: boolean}>`
	position: absolute;
	top: 0;
	width: 100%;
	z-index: 5;
	pointer-events: auto;
	background-color: ${p => (p.open ? "rgba(0, 0, 0, 0.6)" : "none")};

	@media ${props => props.theme.device.tablet} {
		background-color: none;
  }
`;

const MenuContainer = styled.div`
	display: flex;
	padding: ${props => props.theme.spacing.gapSmall};
	/* flex-flow: column; */
	/* justify-content: center; */
	flex-flow: row wrap;
	justify-content: space-between;
	background-color: rgba(0, 0, 0, 0.8);

	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-between;
  }
`;

const User = styled.div<{open: boolean}>`
	display: flex;
	flex-flow: row wrap;
	justify-content: flex-end;
	width: 40%;
	
	/* @media ${props => props.theme.device.tablet} {
		display: none;
  } */
`;

const Status = styled(StatusModal)<{open: boolean}>`
	display	
	@media ${props => props.theme.device.tablet} {
		display: none;
  }
	color: red;
`;

const StyledNav = styled(Nav)`
	/* order: 0;
	@media ${props => props.theme.device.tablet} {
		order: 1;
  } */
`;



const InfoContainer = styled.div<{open: boolean}>`
	display: ${p => (p.open ? "flex" : "none")};
	flex-flow: row;
	justify-content: center;

	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row;
		justify-content: flex-end;
  }
`;


const LogoImg = styled.img<{open: boolean}>`
	background-color: ${p => (p.open ? "gray" : "white")};
	padding: ${props => props.theme.spacing.gapSmall};
	height: 25px;
	margin-left: ${props => props.theme.spacing.gapSmall};
	border-radius: 50%;

	@media ${props => props.theme.device.tablet} {
	  height: 30px;
  }
`;


export default MenuOverlay;
