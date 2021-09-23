import styled from 'styled-components';
import { Fish } from '../utils/fish';
import defaultImage from '../img/default.png'

type Props = {
  fish: Fish;
	onClick?: () => void;
};

const FishNFT = ({ fish, onClick }: Props) => {
	
	return (
		<FishContainer onClick={onClick}>
			{fish.imgSrc ?
				<FishImg src={fish.imgSrc}></FishImg>
				:
				<FishImg src={defaultImage}></FishImg>
			}
			<FishStats>
				<FishData>Id:{fish.tokenId}</FishData>
				<FishData>Str:{fish.strength}</FishData>
				<FishData>Int:{fish.intelligence}</FishData>
				<FishData>Agi:{fish.agility}</FishData>
				<FishData>Wins: {fish.wins}</FishData>
			</FishStats>
			
		</FishContainer>
	);
};

const FishContainer = styled.div`
	position: relative;
	display: flex;
	flex-flow: column;
	align-items: center;
	border-radius: 50%;
	padding: ${props => props.theme.spacing.gap};
	margin: 15px;
	background-color: rgba(255, 255, 255, 0.5);
	box-shadow: 2px 8px 10px 4px rgba(0, 0, 0, 0.3);
	width: 100%;
	height: 100%;
`;

const FishImg = styled.img`
	width: 100%;
	height: 100%;
	border-radius: 50%50%;
`;

const FishStats = styled.div`
	position: absolute;
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	width: 80%;
	bottom: 5%;
	padding: ${props => props.theme.spacing.gap};
`;

const FishName = styled.h3`
	position: absolute;
	
	color: ${"black"};
`;

const FishData = styled.p`
	color: ${"black"};
	background-color: rgba(255, 255, 255, 0.7);
	margin: 0 ${props => props.theme.spacing.gapSmall};
	padding: ${props => props.theme.spacing.gapSmall};
	border-radius: 50%;
`;

export default FishNFT;
