// React
import React from 'react';
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

type Props = {
  children?: React.ReactNode;
};

const Game = ({ children }: Props) => {
  const [cookies, setCookie] = useCookies(['accepted_terms']);

  const checkTerms = () => {
    console.log("clcik")
    if(cookies['accepted_terms'] == true) return;
    setCookie('accepted_terms', true);
    console.log(cookies['accepted_terms'])
  }

	return (
    <UnityWindow>
      <Viewer onClick={() => checkTerms()}>
        {cookies['accepted_terms'] && 
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
  height: 30%;
  bottom: 0;
  background: white;
  z-index: 5;
`;

export default Game;
