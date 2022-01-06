
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
import Blockchain from './BlockchainStatus';


import SeasonStatus from './SeasonStatus';
import UnityWindow from "./UnityWindow";
import FishingStatus from "./FishingStatus";
import FightingStatus from "./WatersStatus";
import BreedingStatus from "./BreedingStatus";
import { useState } from "react";
import WatersStatus from "./WatersStatus";



const MenuOverlay = () => {
	const { account } = useWeb3React();
	const [open, setOpen] = useState(false);
	
	return (
		<>
			<Wrapper open={open}>
				<MenuButton open={open} onClick={() => setOpen(!open)}>Menu</MenuButton>
				<MenuCloseButton open={open} onClick={() => setOpen(!open)}>Close</MenuCloseButton>

				<Container open={open}>
					<StatsContainer>
						<Routes>
							<Route path="fishing" element={<WatersStatus type="Fishing"/>} />
							<Route path="fishing/:id" element={<WatersStatus type="Fishing" />} />
							<Route path="fighting" element={<WatersStatus type="Fighting" />} />
							<Route path="fighting/:id" element={<WatersStatus type="Fighting" />} />
							<Route path="breeding" element={<WatersStatus type="Breeding" />} />
							<Route path="breeding/:id" element={<WatersStatus type="Breeding" />} />
						</Routes>
					</StatsContainer>
					<StyledNav></StyledNav>
					<StatsContainer>
						<SeasonStatus></SeasonStatus>
					</StatsContainer>
				</Container>

				<UserWrapper open={open}>
					<UserContainer>
						<Account/>
						{account && 
							<Balance></Balance>
						}
					</UserContainer>
				</UserWrapper>
					
			</Wrapper>
		</>
		
	);
};

interface Props {
	open?: boolean;
}

const MenuButton = styled.button<{open: boolean}>`
	display: ${p => (p.open ? "none" : "block")};
	@media ${props => props.theme.device.tablet} {
		display: none;
  }
`;

const MenuCloseButton = styled.button<{open: boolean}>`
	display: ${p => (p.open ? "block" : "none")};
	@media ${props => props.theme.device.tablet} {
		display: none;
  }
`;

const StyledNav = styled(Nav)`
	order: 0;
	@media ${props => props.theme.device.tablet} {
		order: 1;
  }
`;

const UserContainer = styled.div`
	display: flex;
	flex-flow: column;
	align-items: center;
	/* background-color: rgba(0, 0, 0, 0.5); */
	/* background-color: rgba(0, 0, 0, 0.5);
	width: 100%; */
	padding: ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
		flex-flow: column;
		align-items: flex-end;
  }
`;

const UserWrapper = styled.div<{open: boolean}>`
	display: ${p => (p.open ? "flex" : "none")};
	flex-flow: row;
	justify-content: center;

	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row;
		justify-content: flex-end;
  }
`;


const Container = styled.div<{open: boolean}>`
	display: ${p => (p.open ? "flex" : "none")};
	padding: ${props => props.theme.spacing.gapSmall};
	flex-flow: column;
	justify-content: center;

	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-between;
  }
`;


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

const StatsContainer = styled.div`
	width: 100%;
	order: 1;
	&:nth-child(2n) {
		order: 2;
	}

	@media ${props => props.theme.device.tablet} {
		width: 25%;
  }
`;


export default MenuOverlay;
