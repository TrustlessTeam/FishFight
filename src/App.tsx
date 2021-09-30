// FishFight
import { useFishFight } from './context/fishFightContext';

// React
import {
  BrowserRouter as Router,
  Switch,
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
import Account from './components/Account';
import Balance from './components/Balance';
import CatchFish from './components/CatchFish';

import Game from './components/Game';
import logo from '../src/img/FishFightLogo.png'


const App = () => {
	const {FishFight} = useFishFight()
	console.log(FishFight.factory)
	// Will all remain undefined until user logs in
	// If user is using harmony wallet, library will only contain blockchain
	// If user is using other wallet, library will have a web3Provider
	const { account } = useWeb3React();
	

	return (
		<ThemeProvider theme={BaseTheme}>
			<Router>
				<Wrapper>
					<Container>
						<Topbar>
							<Logo to={"/"}>
								<LogoImg src={logo}></LogoImg>
							</Logo>
							
							<Nav>
								<GameButton to="/view"><span>See<br></br>Fish!</span></GameButton>
								<GameButton to="/catch"><span>Catch<br></br>Fish!</span></GameButton>
								<GameButton to="/fight"><span>Fight<br></br>Fish!</span></GameButton>
							</Nav>

							<AccountContainer>
								{/* <LinkButton to="/learn">Learn</LinkButton> */}
								{account &&
									<Balance />
								}
								<Account/>
							</AccountContainer>
							
						</Topbar>

						<Switch>
							<Route path="/learn">
								<CatchFish/>
							</Route>
							<Route path="/">
								<Game />
							</Route>
						</Switch>		

						
					</Container>
					<ToastContainer
						position="bottom-right"
						newestOnTop={false}
						pauseOnFocusLoss={false}
						pauseOnHover={false}
						rtl={false}
					/>
				</Wrapper>
			</Router>
		</ThemeProvider>
			
	);
};

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
	margin: ${props => props.theme.spacing.gap};
	width: 95%;
	height: 8%;
	z-index: 5;
`;

const AccountContainer = styled.div`
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
	font-size: ${props => props.theme.font.large}vmin;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;

const LinkButton = styled(Link)`
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
	font-size: ${props => props.theme.font.medium}vmin;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;

const Logo = styled(Link)`
	display: none;
	@media ${props => props.theme.device.tablet} {
    display: flex;
		flex-flow: row nowrap;
		justify-content: center;
		align-items: center;
		width: 20%;
  }
`;

const LogoImg = styled.img`
	width: 100%;
`;



const Nav = styled.nav`
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-evenly;
	align-items: center;
	width: 100%;
	height: 100%;
`;

export default App;
