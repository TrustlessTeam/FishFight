import styled from 'styled-components';
import { Fish } from '../utils/fish';
import defaultImage from '../img/default.png'
import { useState } from 'react';

import fishingImg from "../img/icons/fishing.svg"
import breedingImg from "../img/icons/breeding.svg"
import fightingImg from "../img/icons/fighting.svg"
import oceanImg from "../img/icons/ocean.svg"
import fishImg from "../img/icons/fish.svg"

type Props = {
  fish: Fish;
	onClick?: () => void;
	selectedUser?: boolean;
	selectedOpponent?: boolean;
};

interface ImgProps {
	selectedOpponent?: boolean;
	selectedUser?: boolean;
}

const FishNFT = ({ fish, onClick, selectedOpponent, selectedUser }: Props) => {
	const [showStats, setShowStats] = useState<boolean>(false);

	const toggleStats = () => {
		setShowStats(prevShowStats => (!prevShowStats));
	}

	return (
		<FishContainer>
			{fish.imgSrc ?
				<FishImg selectedOpponent={selectedOpponent} selectedUser={selectedUser} onClick={onClick} src={fish.imgSrc}></FishImg>
				:
				<FishImg selectedOpponent={selectedOpponent} selectedUser={selectedUser} onClick={onClick} src={defaultImage}></FishImg>
			}
			<FishStats>
				{!fish.stakedFighting && !fish.stakedBreeding &&
					<LogoSmallImg src={fishImg} alt="$FISH"></LogoSmallImg>
				}
				{fish.stakedFighting &&
					<LogoImg src={fightingImg} alt="$FIGHTFISH"></LogoImg>
				}
			</FishStats>
			<FishId>
				<FishData>{fish.tokenId}</FishData>
				{/* <ToggleButton onClick={() => toggleStats()}>info</ToggleButton> */}
			</FishId>

			{/* {showStats &&
				<FishStatsOverlay>
					<FishData>Str:{fish.strength}</FishData>
					<FishData>Int:{fish.intelligence}</FishData>
					<FishData>Agi:{fish.agility}</FishData>
					<FishData>Wins: {fish.lifetimeWins}</FishData>
					{fish.ipfsLink &&
					<FishData><a target="_blank" href={fish.ipfsLink}>IPFS</a></FishData>
					}
				</FishStatsOverlay>
			} */}
			
		</FishContainer>
	);
};

const ToggleButton = styled.button`
	padding: ${props => props.theme.spacing.gapSmall};
	border: none;
	border-radius: 50%;
	font-size: ${props => props.theme.font.small};
	font-weight: bold;
	color: black;
	background-color: white;
	cursor: pointer; 
`;

const LogoImg = styled.img`
	width: 50px;
`;
const LogoSmallImg = styled.img`
	width: 40px;
`;

const FishContainer = styled.div`
	position: relative;
	display: flex;
	flex-flow: column;
	justify-content: flex-end;
	align-items: center;
	margin: 0 ${props => props.theme.spacing.gapSmall};
`;

const FishImg = styled.img<ImgProps>`
	height: 12vh;
	border-radius: 50%;
	border: 0.5vh solid rgba(255, 255, 255, 0.5);
	cursor: pointer; 
	${({ selectedUser }) => selectedUser && `
    border-color: rgba(0, 128, 0, 0.5)
  `}
	${({ selectedOpponent }) => selectedOpponent && `
    border-color: rgba(154, 3, 30, 0.5)
  `}
`;

const FishId = styled.div`
	position: absolute;
	display: flex;
	flex-flow: row wrap;
	justify-content: space-between;
	width: 100%;
	bottom: 0;
	padding: ${props => props.theme.spacing.gapSmall};
	pointer-events: none;
`;

const FishStats = styled.div`
	position: absolute;
	display: flex;
	flex-flow: row wrap;
	justify-content: flex-end;
	width: 100%;
	top: 0;
	pointer-events: none;
	/* padding: ${props => props.theme.spacing.gapSmall}; */
`;

const FishStatsOverlay = styled.div`
	position: absolute;
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	align-items: flex-start;
	height: 17vh;
	top: 50;
	bottom: 50;
	border-radius: 50%;
`;

const FishData = styled.p`
	display: flex;
	flex-flow: column;
	align-items: center;
	justify-content: center;
	color: ${"black"};
	text-align: center;
	font-size: ${props => props.theme.font.medium};
	font-weight: bold;
	background-color: white;
	margin: 0 ${props => props.theme.spacing.gapSmall};
	padding: ${props => props.theme.spacing.gapSmall};
	border-radius: 50%;
	height: ${props => props.theme.font.small}vmin;
`;

export default FishNFT;
