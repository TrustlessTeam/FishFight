
// React
import {
  Link,
	Outlet,
	Route,
	Routes
} from "react-router-dom";

// React web3
import { useWeb3React } from '@web3-react/core';

// React toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styled Components
import styled, { ThemeProvider } from 'styled-components';
import { BaseTheme } from '../default-theme';

// Components
import Nav from './Nav';
import Account from './Account';
import Balance from './Balance';

import logo from '../src/img/FishFightLogo.png'
import Blockchain from './BlockchainStatus';


import SeasonStatus from './SeasonStatus';
import UnityWindow from "./UnityWindow";
import FishingStatus from "./FishingStatus";



const UILayout = () => {
	const { account } = useWeb3React();
	
	return (
		<Wrapper>
			<Container>
				<Topbar>

					
			
					<Nav></Nav>

					<StatsContainer>
						<Stats>
							<SeasonStatus></SeasonStatus>
							<Account/>
						</Stats>
						
						<ExtraStats>
							{account && 
								<Balance></Balance>
							}
						</ExtraStats>

						<ExtraStats>
							<Routes>
								<Route path="/fishing" element={<FishingStatus />} />
								{/* <Route path="/ocean" element={<Ocean />} />
								
								<Route path="/fighting" element={<FightingWaters />}>
									<Route path="/fighting/user" element={<UserFightingWaters />} />
									<Route path="/fighting/start" element={<StartFight />} />
								</Route>
								<Route path="/breeding" element={<BreedingWaters />}>
									<Route path="/breeding/user" element={<UserBreedingWaters />} />
									<Route path="/breeding/start" element={<StartBreed />} />
								</Route> */}
							</Routes>	
						</ExtraStats>
					</StatsContainer>
					
				</Topbar>
				

				<Outlet />


				<Blockchain></Blockchain>

			</Container>
			<ToastContainer
				position="bottom-right"
				newestOnTop={false}
				pauseOnFocusLoss={false}
				pauseOnHover={false}
				rtl={false}
			/>
		</Wrapper>
	);
};

const Stats = styled.div`
	display: flex;
	flex-flow: row;
	align-items: center;
`;

const ExtraStats = styled.div`
	display: flex;
	flex-flow: column;
`;

const Wrapper = styled.div`
	display: flex;
	flex-flow: row wrap;
	width: 100vw;
	max-height: 100vh;
	/* background-color: darkblue; */
	background-image: none;
	font-size: 1rem;
`;

const Container = styled.div`
	display: flex;
	width: 100vw;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	height: 100vh;
	margin: 0 auto;
`;

const Topbar = styled.div`
	position: absolute;
	top: 0;
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-evenly;
	align-items: center;
	/* margin: ${props => props.theme.spacing.gap}; */
	margin-top: 4px;
	width: 98%;
	height: 8%;
	z-index: 5;
	pointer-events: auto;
`;

const StatsContainer = styled.div`
	display: flex;
	flex-flow: column;
	align-items: flex-end;
	justify-content: space-evenly;
	width: 30%;
`;


export default UILayout;
