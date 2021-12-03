import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

import useHorizontalScroll from "../utils/horizontalScrolling";
import FishNFT from './FishNFT';
import { Fish } from '../utils/fish';


type Props = {
  fishCollection: Fish[];
	onClick?: (fish: Fish) => void;
};

const FishViewer = ({ fishCollection, onClick }: Props) => {
	const [showStats, setShowStats] = useState<boolean>(false);

	const scrollRef = useHorizontalScroll();

	return (
		<FishGrid ref={scrollRef}>
		{
			fishCollection?.map((fish, index) => (
				<FishNFT onClick={onClick ? () => onClick(fish) : undefined} fish={fish} key={index}></FishNFT>
			))
		}
		</FishGrid>
	);
};

interface GridProps {
	ref?: any;
}

const FishGrid = styled.div<GridProps>`
	display: flex;
	flex-direction: row nowrap;
	justify-content: space-between;
	overflow-y: hidden;
	overflow-x: hidden;
	pointer-events: auto;
`;

export default FishViewer;
