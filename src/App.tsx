import {
  Routes,
  Route
} from "react-router-dom";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styled Components
import styled, { ThemeProvider } from 'styled-components';
import { BaseTheme } from './default-theme';

// Components

import CatchFish from './components/CatchFish';
import logo from '../src/img/FishFightLogo.png'
import Blockchain from './components/BlockchainStatus';



import UnityWindow from './components/UnityWindow';
import Ocean from './components/Ocean';
import FightingWaters from './components/FightingWaters';
import BreedingWaters from './components/BreedingWaters';
import MenuOverlay from './components/MenuOverlay';
import Default from './components/Default';

const App = () => {
	return (
		<ThemeProvider theme={BaseTheme}>	
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

export default App;
