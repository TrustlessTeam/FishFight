// FishFight
import { useFishFight } from './context/fishFightContext';

// React
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

// React web3
import { useWeb3React } from '@web3-react/core';

// React toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styled Components
import styled, { ThemeProvider } from 'styled-components';
import { BaseTheme } from './default-theme';

// Components
import Nav from './components/Nav';
import Account from './components/Account';
import Balance from './components/Balance';
import CatchFish from './components/CatchFish';

import logo from '../src/img/FishFightLogo.png'
import Blockchain from './components/BlockchainStatus';


import SeasonStatus from './components/SeasonStatus';
import UnityWindow from './components/UnityWindow';
import Ocean from './components/Ocean';
import FightingWaters from './components/FightingWaters';
import UILayout from './components/MenuOverlay';
import StartFight from './components/StartFight';
import BreedingWaters from './components/BreedingWaters';
import StartBreed from './components/StartBreed';
import { isMobile } from 'react-device-detect';
import MenuOverlay from './components/MenuOverlay';
import Default from './components/Default';

const App = () => {
	// const {FishFight} = useFishFight()
	// Will all remain undefined until user logs in
	// If user is using harmony wallet, library will only contain blockchain
	// If user is using other wallet, library will have a web3Provider
	const { account } = useWeb3React();
	

	return (
		<ThemeProvider theme={BaseTheme}>
			{/* <Router> */}
				
				<Wrapper>
					<Container>
						<MenuOverlay></MenuOverlay>
						<Routes>
							<Route element={<UnityWindow />}>
									<Route path="/" element={<Default />} />
									<Route path="/ocean" element={<Ocean />} />
									<Route path="/fishing" element={<CatchFish />} />
									<Route path="/fighting" element={<FightingWaters />}>
										{/* <Route path="/fighting/user" element={<FightingWaters />} /> */}
										<Route path="/fighting/start" element={<FightingWaters />} />
									</Route>
									<Route path="/breeding" element={<BreedingWaters />}>
										{/* <Route path="/breeding/user" element={<UserBreedingWaters />} /> */}
										{/* <Route path="/breeding/start" element={<StartBreed />} /> */}
									</Route>

							</Route>
          	</Routes>	
	

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
		</ThemeProvider>
			
	);
};

const Stats = styled.div`
	display: flex;
	flex-flow: column;
`;

const Wrapper = styled.div`
	display: flex;
	flex-flow: row wrap;
	width: 100vw;
	max-height: 100vh;
	background-color: ${props => props.theme.colors.color1};
	background-image: ${props => props.theme.colors.gradientTop};
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
	flex-flow: row nowrap;
	align-items: center;
	justify-content: space-evenly;
	width: 30%;
`;

const GameButton = styled(Link)`
	text-align: center;
	padding: 2.2vmin;
	border-radius: 50%;
	background-color: white;
	opacity: 0.7;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.25);
	color: black;
	margin-left: ${props => props.theme.spacing.gapSmall};
	transition: opacity 0.3s ease, box-shadow 0.25s ease-in-out;
	text-transform: uppercase;
	font-weight: bolder;
	text-decoration: none;
	font-size: ${props => props.theme.font.large};

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;

const Text = styled.p`
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

const Logo = styled(Link)`
	display: none;
	height: 100%;
	@media ${props => props.theme.device.tablet} {
    display: flex;
		flex-flow: row nowrap;
		justify-content: center;
		align-items: center;
		width: 20%;
  }
`;

const LogoImg = styled.img`
	height: 100%;
	border: 3px solid white;
	border-radius: 50%;
`;





// const baseSize = 

const BubbleButton = styled(Link)`
	transition: opacity 0.3s ease, box-shadow 0.25s ease-in-out;
	font-weight: bolder;
	text-decoration: none;
	color: white;
	padding: 2.2vmin;
	border-radius: 50%;
	box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2), inset 0px 5px 15px 2.5px rgba(255, 255, 255, 1);
	height: 50px;
	width: 50px;
	/* position: absolute; */
	position: relative;
	/* width: 100px; */
	/* top: 500px; */

	&:after {
		background: radial-gradient(ellipse at center,  rgba(255,255,255,0.5) 0%,rgba(255,255,255,0) 70%); /* W3C */
		border-radius: 50%;
		box-shadow: inset 0 10px 15px rgba(255, 255, 255, 0.3);
		content: "";
		/* height: 90px; */
		left: 5px;
		position: absolute;
		/* width: 90px; */
	}
`; 

export default App;
