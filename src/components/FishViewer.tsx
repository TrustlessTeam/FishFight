import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

import useHorizontalScroll from "../utils/horizontalScrolling";
import FishNFT from './FishNFT';
import { Fish } from '../utils/fish';
import Menu, { MenuItem } from "../components/Menu";


const sortId = (a: Fish, b: Fish) => a.tokenId - b.tokenId;
const sortAgi = (a: Fish, b: Fish) => a.agility - b.agility;
const sortStr = (a: Fish, b: Fish) => a.strength - b.strength;
const sortInt = (a: Fish, b: Fish) => a.intelligence - b.intelligence;
const sortWins = (a: Fish, b: Fish) => a.lifetimeWins - b.lifetimeWins;

enum SortSelection {
	'Id',
	'Strength',
	'Intelligence',
	'Agility'
}

type Props = {
  fishCollection: Fish[];
	onClick?: (fish: Fish) => void;
	selectedFish?: Fish | null;
	selectedOpponent?: Fish | null;
};

const FishViewer = ({ fishCollection, onClick, selectedFish, selectedOpponent }: Props) => {
	const [showStats, setShowStats] = useState<boolean>(false);
	const [sortOption, setSortOption] = useState<number>(SortSelection.Id);

	const SortOptions = [
		{
			name: "Id",
			onClick: () => setSortOption(SortSelection.Id),
			sortFn: sortId
		},
		{
			name: "Strength",
			onClick: () => setSortOption(SortSelection.Strength),
			sortFn: sortStr
		},
		{
			name: "Intelligence",
			onClick: () => setSortOption(SortSelection.Intelligence),
			sortFn: sortInt
		},
		{
			name: "Agility",
			onClick: () => setSortOption(SortSelection.Agility),
			sortFn: sortAgi
		},
	]

	const scrollRef = useHorizontalScroll();

	return (
		<>
		{fishCollection.length > 0 &&
			<SortMenu>
				<Menu name={`Sort by: ${SortSelection[sortOption]}`} items={SortOptions}></Menu>
			</SortMenu>
		}
			<FishGrid ref={scrollRef}>
			{
				fishCollection.sort(SortOptions[sortOption].sortFn)?.map((fish, index) => (
					<FishNFT selectedOpponent={selectedOpponent?.tokenId === fish.tokenId} selectedUser={selectedFish?.tokenId === fish.tokenId} onClick={onClick ? () => onClick(fish) : undefined} fish={fish} key={index}></FishNFT>
				))
			}
			</FishGrid>
		</>
		
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

const SortMenu = styled.div`
	position: absolute;
	bottom: 12vh;
	right: ${props => props.theme.spacing.gap};;
	/* width: 100px; */
	padding: ${props => props.theme.spacing.gap};
	pointer-events: auto;
	
	
`;

export default FishViewer;
