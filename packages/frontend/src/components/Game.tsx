// React
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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

const Game = ({ children }: Props) => {
  const location = useLocation();
	const { FishFight, userFish, refetchUserFish, publicFish, refetchPublicFish } = useFishFight();
  const [currentView, setCurrentView] = useState<Views>(Views.Ocean);

  useEffect(() => {
		// Set page components based on location
    console.log(location.pathname)
    const pathname = location.pathname.toString();
    switch (pathname) {
      case '/fish':
        setCurrentView(Views.Fishing)
        break;
      case '/fight':
        setCurrentView(Views.Fight)
        break;
      default:
        setCurrentView(Views.Ocean)
        break;
    }
		async function updateFishLists() {
			await refetchUserFish();
			await refetchPublicFish();
		}
		updateFishLists();
    console.log(currentView)
		
	}, [location]);

	return (
    <UnityWindow>
      <Viewer>
        {currentView == Views.Ocean &&
          <ViewFish></ViewFish>
        }
        {currentView == Views.Fight &&
          <FightFish></FightFish>
        }
        {currentView == Views.Fishing &&
          <CatchFish></CatchFish>
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
	width: 100%;
  height: 30%;
  bottom: 0;
  background: white;
  z-index: 5;
`;

export default Game;
