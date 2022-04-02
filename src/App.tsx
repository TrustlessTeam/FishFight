import { Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Styled Components
import styled, { ThemeProvider } from "styled-components";
import { BaseTheme } from "./default-theme";

// Components
import Countdown from 'react-countdown';


import UnityWindow from "./components/UnityWindow";
import Ocean from "./components/Ocean";
import FightingWaters from "./components/FightingWaters";
import BreedingWaters from "./components/BreedingWaters";
import MenuOverlay from "./components/MenuOverlay";
import Default from "./components/Default";
import FishingWaters from "./components/FishingWaters";
import DisclaimerModal from "./components/DisclaimerModal";
import { useContractWrapper } from "./context/contractWrapperContext";

type RenderProps = {
  hours: any;
  minutes: any;
  seconds: any;
  completed: boolean;
}
const renderer = ({ hours, minutes, seconds, completed }: RenderProps) => {
  // Render a countdown
  return <Time><Hour>{hours} hrs</Hour><Minute>{minutes} mins</Minute><Second>{seconds} secs</Second></Time>;
};

const App = () => {
  const { pendingTransaction } = useContractWrapper()
  return (
    <ThemeProvider theme={BaseTheme}>
      <Wrapper>
        <PendingOverlay open={pendingTransaction} className={pendingTransaction ? "active" : ""}>
          <div className="lds-ripple"><div></div><div></div></div>
          <LoadingText>Waiting for Transaction...</LoadingText>
        </PendingOverlay>

        <Container>
          <MenuOverlay></MenuOverlay>
          <DisclaimerModal></DisclaimerModal>
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

const PendingOverlay = styled.div<{open: boolean}>`
  position: absolute;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  opacity: 0;
  background-color: rgba(25, 22, 209, 0.466);
  z-index: 100;
  pointer-events: none;
  transition: all 0.25s ease-in-out;
  /* ${({ open }) =>
    open ?
    `
    display: block;
    `
    :
    `
    display: none;
    `
  } */
  &.active {
    pointer-events: auto;
    opacity: 1;
  }
`;

const LoadingText = styled.h1`
  color: white;

  margin: 0 auto;
`;


const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100vw;
  height: 100vh;
  max-height: 100%;
  max-width: 100%;
  background-color: ${(props) => props.theme.colors.color1};
  background-image: ${(props) => props.theme.colors.gradientTop};
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

const Time = styled.div`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: space-between;
`;

const Text = styled.p`
  color: white;
`

const Hour = styled(Text)`
	font-size: ${props => props.theme.font.medium};
	padding-right: ${props => props.theme.spacing.gapSmall};
	
	@media ${props => props.theme.device.tablet} {
	  font-size: ${props => props.theme.font.large};
  }
`;

const Minute = styled(Text)`
	font-size: ${props => props.theme.font.small};
	padding-right: ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
	  font-size: ${props => props.theme.font.medium};
  }
`;

const Second = styled(Text)`
	font-size: 10px;
	padding-right: ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
	  font-size: ${props => props.theme.font.small};
  }
`;

export default App;
