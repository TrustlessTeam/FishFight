import styled from 'styled-components';
import { Fish } from '../utils/fish';

type Props = {
  fish: Fish;
};

const FishNFT = ({ fish }: Props) => {
	
	return (
		<FishContainer>
			<FishName>{fish.tokenId}</FishName>
			<FishData>Strength: {fish.strength}</FishData>
			<FishData>Intelligence: {fish.intelligence}</FishData>
			<FishData>Agility: {fish.agility}</FishData>
			<FishData>Wins: {fish.wins}</FishData>
		</FishContainer>
	);
};

const FishContainer = styled.div`
	display: flex;
	flex-flow: column;
	align-items: center;
	border-radius: 25px;
	padding: 30px;
	margin: 15px;
	background-color: white;
	box-shadow: 2px 8px 10px 4px rgba(0, 0, 0, 0.3);
`;

const FishName = styled.h3`
	color: ${"black"};
`;

const FishData = styled.p`
	color: ${"black"};
	margin: 0;
`;

export default FishNFT;
