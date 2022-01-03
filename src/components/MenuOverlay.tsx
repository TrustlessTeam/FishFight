
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



const MenuOverlay = () => {
	const { account } = useWeb3React();
	
	return (
		<>
			<Wrapper>
				<Container>
					<StatsContainer>
						<Routes>
							<Route path="/fishing" element={<FishingStatus />} />
						</Routes>
					</StatsContainer>
					<Nav></Nav>
					<StatsContainer>
						<SeasonStatus></SeasonStatus>
					</StatsContainer>
				</Container>

				<UserWrapper>
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

const UserContainer = styled.div`
	display: flex;
	flex-flow: column;
	align-items: flex-end;
	/* background-color: rgba(0, 0, 0, 0.5); */
	/* background-color: rgba(0, 0, 0, 0.5);
	width: 100%; */

	/* @media ${props => props.theme.device.tablet} {
		width: 10%;
  } */

	padding: ${props => props.theme.spacing.gapSmall};
`;

const UserWrapper = styled.div`
	display: flex;
	flex-flow: row;
	justify-content: flex-end;
`;


const Container = styled.div`
	display: flex;
	padding: ${props => props.theme.spacing.gapSmall};
	flex-flow: row wrap;
	justify-content: center;

	@media ${props => props.theme.device.tablet} {
		flex-flow: row nowrap;
		justify-content: space-between;
  }
	/* background-color: rgba(0, 0, 0, 0.5); */

`;


const Wrapper = styled.div`
	position: absolute;
	top: 0;
	width: 100%;
	z-index: 5;
	pointer-events: auto;
`;

const StatsContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: center;
	width: 25%;
`;


export default MenuOverlay;
