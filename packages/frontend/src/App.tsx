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
import styled from 'styled-components';

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
		<Router>
			<Wrapper>
				<Container>
					{account ?
					<>
						<Topbar>
							<Nav>
								<ul>
									<li>
										<Link to="/">View Fish</Link>
									</li>
									<li>
										<Link to="/catch">Catch A Fish!</Link>
									</li>
									<li>
										<Link to="/fight">Fight A Fish!</Link>
									</li>
								</ul>
							</Nav>
							
							<Flex>
								<Balance />
								<Account />
							</Flex>
						</Topbar>

						<Content>				
							{/* <UnityWindow /> */}
							
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
					</> :
					<>
						<Account/>
						<ViewFish />
					</>
				}
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
	);
};

const Flex = styled.div`
	display: flex;
	align-items: center;
`;

const Nav = styled.nav`
	display: flex;
	width: 100%;
`;

const Topbar = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 74px;
	width: 100%;
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
	background-color: #0093e9;
	background-image: linear-gradient(160deg, #0093e9 0%, #80d0c7 100%);
	font-size: 1rem;
	color: white;
`;

export default App;
