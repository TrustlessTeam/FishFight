// React
import React, { useEffect } from 'react';
import {
  Switch,
  Route
} from "react-router-dom";

// Styled Components
import styled from 'styled-components';
import UnityWindow from './UnityWindow';
import FightFish from './FightFish';
import ViewFish from './ViewFish';
import CatchFish from './CatchFish';

import { useCookies } from 'react-cookie';
import { useUnity } from '../context/unityContext';


type Props = {
  children?: React.ReactNode;
};

const Game = ({ children }: Props) => {
  const [cookies] = useCookies(['accepted_terms']);

  // useEffect(() => {
	// 	console.log("Fish arrays changed")
	// }, [cookies]);

	return (
    <UnityWindow>
      <Viewer>
        {cookies['accepted_terms'] && 
          <Switch>
            <Route path="/catch">
              <CatchFish/>
            </Route>
            <Route path="/fight">
              <FightFish />
            </Route>
            <Route path="/view">
              <ViewFish />
            </Route>
            <Route path="/">
            </Route>
          </Switch>	
        }
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
  height: 27%;
  bottom: 0;
  background: white;
  z-index: 5;
`;

export default Game;
