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
import UnityWindow from './components/UnityWindow';

// Logo
import FightFish from './components/FightFish';
import ViewFish from './components/ViewFish';
import Game from './components/Game';
import logo from '../src/img/harmony_logo.svg'


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
							<Logo>
								<LogoImg src={logo}></LogoImg>
							</Logo>
							
							<Nav>
								<LinkButton to="/">View Fish</LinkButton>
								<LinkButton to="/catch">Catch Fish</LinkButton>
								<LinkButton to="/fight">Fight Fish</LinkButton>
							</Nav>
							{account &&
								<Balance />
							}
							<Account/>
						</Topbar>
						<Content>
							<Switch>
								<Route path="/fight">
									<FightFish />
								</Route>
								<Route path="/catch">
									<CatchFish/>
								</Route>
								<Route path="/">
									<Game />
								</Route>
							</Switch>		
						</Content>
						
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
	justify-content: center;
	min-height: 100vh;
	margin: 0 auto;
`;

const Topbar = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	background-color: white;
	align-items: flex-end;
	margin: 0 ${props => props.theme.spacing.gap};
	width: 100%;
	height: 5%;
`;

const Content = styled.div`
	display: flex;
	flex-flow: row wrap;
	align-items: flex-start;
	justify-content: space-evenly;
	width: 100%;
	height: 95%;
	flex: 1;
`;

const LinkButton = styled(Link)`
	padding: ${props => props.theme.spacing.gap};
	border-radius: 5%;
	font-weight: bold;
	text-decoration: none;
	text-transform: uppercase;
	background-color: darkblue;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.25);
	color: white;
	transition: opacity 0.3s ease, box-shadow 0.25s ease-in-out;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;

const Logo = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	width: 10%;
	height: 100%;
`;

const LogoImg = styled.img`
	width: 50px;
	height: 100%;
`;



const Nav = styled.nav`
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-evenly;
	align-items: center;
	width: 100%;
`;

export default App;
