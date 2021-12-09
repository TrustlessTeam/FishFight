// React
import React, { useEffect } from 'react';
import {
  Switch,
  Route
} from "react-router-dom";

// Styled Components
import styled from 'styled-components';
import UnityWindow from './UnityWindow';
import FightingWaters from './FightingWaters';
import Ocean from './Ocean';
import CatchFish from './CatchFish';

import { useCookies } from 'react-cookie';
import { useFishFight } from '../context/fishFightContext';
import ConnectWallet from './ConnectWallet';
import UserFightingWaters from './UserFightingWaters';


type Props = {
  children?: React.ReactNode;
};

const Game = ({ children }: Props) => {
  const [cookies] = useCookies(['accepted_terms']);
  const { userConnected } = useFishFight();


  // useEffect(() => {
	// 	console.log("Fish arrays changed")
	// }, [cookies]);

	return (
    <UnityWindow>
      <Viewer>
        {cookies['accepted_terms'] && 
          <Switch>
            <Route path="/fishing">
              {
                userConnected &&
                <CatchFish />
              }
              {
                !userConnected &&
                <ConnectWallet />
              }
            </Route>
            <Route path="/fighting">
              <FightingWaters />
            </Route>
            <Route path="/breeding">
              <FightingWaters />
            </Route>
            <Route path="/ocean">
              <Ocean />
            </Route>
            <Route path="/fighting-user">
              <UserFightingWaters />
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
  height: 100%;
  pointer-events: none;
  bottom: 0;
  background: white;
  z-index: 5;
`;

export default Game;
