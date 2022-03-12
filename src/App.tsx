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

import CatchFish from './components/FishingWaters';
import logo from '../src/img/FishFightLogo.png'
import Blockchain from './components/BlockchainStatus';



import UnityWindow from './components/UnityWindow';
import Ocean from './components/Ocean';
import FightingWaters from './components/FightingWaters';
import BreedingWaters from './components/BreedingWaters';
import MenuOverlay from './components/MenuOverlay';
import Default from './components/Default';
import FishingWaters from "./components/FishingWaters";
import ApprovalModal from "./components/ApprovalModal";

const App = () => {

	return (
		<ThemeProvider theme={BaseTheme}>	
				<Wrapper>
					<Container>
						<MenuOverlay></MenuOverlay>
						<ApprovalModal></ApprovalModal>
						<Routes>
							<Route element={<UnityWindow />}>
									<Route path="/" element={<Default />} />
									<Route path="/ocean" element={<Ocean />} />
									<Route path="/fishing" element={<FishingWaters />} />
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
	

						{/* <Blockchain></Blockchain> */}

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
	height: 100vh;
	max-height: 100%;
	max-width: 100%;
	background-color: ${props => props.theme.colors.color1};
	background-image: ${props => props.theme.colors.gradientTop};
	font-size: 1rem;
`;

const Container = styled.div`
	display: flex;
	width: 100%;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	height: 100%;
	margin: 0 auto;
`;

export default App;
