import styled from 'styled-components';
import { Fish } from '../utils/fish';
import defaultImage from '../img/default.png'
import { useState } from 'react';

type Props = {
  fish: Fish;
	onClick?: () => void;
};

const FishNFT = ({ fish, onClick }: Props) => {
	const [showStats, setShowStats] = useState<boolean>(false);

	const toggleStats = () => {
		setShowStats(prevShowStats => (!prevShowStats));
	}
	return (
		<FishContainer onClick={onClick}>
			{fish.imgSrc ?
				<FishImg src={fish.imgSrc}></FishImg>
				:
				<FishImg src={defaultImage}></FishImg>
			}
			<FishStats>
				<FishData>ID: {fish.tokenId}</FishData>
				<ToggleButton onClick={() => toggleStats()}>info</ToggleButton>
			</FishStats>
			{showStats &&
				<FishStatsOverlay>
					<FishData>Str:{fish.strength}</FishData>
					<FishData>Int:{fish.intelligence}</FishData>
					<FishData>Agi:{fish.agility}</FishData>
					<FishData>Wins: {fish.wins}</FishData>
				</FishStatsOverlay>
			}
			
		</FishContainer>
	);
};

const ToggleButton = styled.button`
	padding: ${props => props.theme.spacing.gapSmall};
	border-radius: 50%;
	font-size: ${props => props.theme.font.small}vmin;
	font-weight: bold;
	color: black;
	background-color: rgba(255, 255, 255, 0.7);
`;

const FishContainer = styled.div`
	position: relative;
	display: flex;
	flex-flow: column;
	align-items: center;
	margin: ${props => props.theme.spacing.gapSmall};
	width: 50vw;
	@media ${props => props.theme.device.tablet} {
		width: 20vw;
  }
	/* @media ${props => props.theme.device.laptop} {
		width: 10vw;
  } */
	@media ${props => props.theme.device.laptopL} {
		width: 10vw;
  }
	/* border-radius: 50%;
	padding: ${props => props.theme.spacing.gap};
	
	background-color: rgba(255, 255, 255, 0.5);
	box-shadow: 2px 8px 10px 4px rgba(0, 0, 0, 0.3);
	width: 40%;
	height: 100%; */
`;

const FishImg = styled.img`
	/* width: 200px; */
	height: 100%;
	width: auto;
	border: ${props => props.theme.spacing.gap} solid rgba(255, 255, 255, 0.5);
	border-radius: 50%;

	/* @media ${props => props.theme.device.tablet} {
		width: 15vw;
  }
	@media ${props => props.theme.device.laptop} {
		width: 10vw;
  }
	@media ${props => props.theme.device.desktop} {
		width: 10vw;
  } */
`;

const FishStats = styled.div`
	position: absolute;
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	width: 100%;
	bottom: 3%;
	padding: ${props => props.theme.spacing.gap};
`;

const FishStatsOverlay = styled.div`
	position: absolute;
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	height: 50%;
	width: 100%;
	top: 0;
	border-radius: 50%;
	padding: ${props => props.theme.spacing.gap};
`;

const FishName = styled.h3`
	position: absolute;
	
	color: ${"black"};
`;

const FishData = styled.p`
	color: ${"black"};
	font-size: ${props => props.theme.font.small}vmin;
	background-color: rgba(255, 255, 255, 0.7);
	margin: 0 ${props => props.theme.spacing.gapSmall};
	padding: ${props => props.theme.spacing.gapSmall};
	border-radius: 50%;
	/* height: 100%; */
`;

export default FishNFT;
