// React
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation
} from "react-router-dom";

// Styled Components
import styled from 'styled-components';
import UnityWindow from './UnityWindow';
import FightFish from './FightFish';
import ViewFish from './ViewFish';
import CatchFish from './CatchFish';
import { useFishFight } from '../context/fishFightContext';

type Props = {
  children?: React.ReactNode;
};

enum Views {
  Ocean,
  Fishing,
  Fight,
  Fish
}

// Try react-router dom here and switch for the different views? Can it still be linked to buttons?
// On View/Fight/Catch render we refetchUser and publicUser and can pass pararmeters to the functions

const Game = ({ children }: Props) => {
  const location = useLocation();
	// const { FishFight, userFish, refetchUserFish, publicFish, refetchPublicFish } = useFishFight();
  const [currentView, setCurrentView] = useState<Views>(Views.Ocean);

  // useEffect(() => {
	// 	async function updateFishLists() {
	// 		await refetchUserFish();
	// 		await refetchPublicFish();
	// 	}
	// 	updateFishLists();
  //   console.log(currentView)
		
	// }, [location]);

	return (
    <UnityWindow>
      <Viewer>
        <Switch>
          <Route path="/catch">
            <CatchFish/>
          </Route>
          <Route path="/fight">
            <FightFish />
          </Route>
          <Route path="/">
            <ViewFish />
          </Route>
        </Switch>	
      </Viewer>
    </UnityWindow>
	);
};


const Viewer = styled.div`
  position: absolute;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-end;
	width: 100%;
  height: 30%;
  bottom: 0;
  background: white;
  z-index: 5;
`;

export default Game;
