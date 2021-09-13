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
import Logo from './img/harmony_logo.svg';
import FightFish from './components/FightFish';
import ViewFish from './components/ViewFish';


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
						{account ?
						<>
							<Topbar>
								<Flex>
									<Balance />
									<Account />
								</Flex>
							</Topbar>
						</> :
						<>
							<Account/>
						</>
					}
						<UnityWindow/>
						<Content>
							<Switch>
								<Route path="/fight">
									<FightFish />
								</Route>
								<Route path="/catch">
									<CatchFish/>
								</Route>
								<Route path="/">
									<ViewFish />
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

const LinkButton = styled(Link)`
	padding: 50px 50px;
	border-radius: 50%;
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

const Flex = styled.div`
	display: flex;
	align-items: center;
`;

const Nav = styled.nav`
	postion: absolute;
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-evenly;
	width: 100%;
	margin: 20px;
`;

const Topbar = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	height: 74px;
	width: 100%;
	z-index: 5;
`;

const Content = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	width: 100%;
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	padding: 0px 24px;
	max-width: 1200px;
	margin: 0 auto;
`;

const Wrapper = styled.div`
	background-color: ${props => props.theme.colors.color1};
	background-image: ${props => props.theme.colors.gradientTop};
	font-size: 1rem;
	color: white;
`;

export default App;
