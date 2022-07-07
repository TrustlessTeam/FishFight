import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled, { ThemeProvider } from "styled-components";
import { BaseTheme } from "./default-theme";

import UnityWindow from "./components/UnityWindow";
import Ocean from "./components/Ocean";
import FightingWaters from "./components/FightingWaters";
import BreedingWaters from "./components/BreedingWaters";
import MenuOverlay from "./components/MenuOverlay";
import Default from "./components/Default";
import FishingWaters from "./components/FishingWaters";
import DisclaimerModal from "./components/DisclaimerModal";
import { useContractWrapper } from "./context/contractWrapperContext";
import FightingWatersWeak from "./components/FightingWatersWeak";
import FightingWatersNonLethal from "./components/FightingWatersNonLethal";

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
              <Route path="/fighting" element={<FightingWaters />}></Route>
              <Route path="/fighting/weak" element={<FightingWatersWeak />} />
              <Route path="/fighting/non-lethal" element={<FightingWatersNonLethal/>} />
              <Route path="/breeding" element={<BreedingWaters />}></Route>
            </Route>
          </Routes>

        </Container>
        <ToastContainer
          position="top-left"
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

export default App;