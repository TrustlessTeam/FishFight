import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import useHorizontalScroll from "../utils/horizontalScrolling";
import FishNFT from "./FishNFT";
import { Fish } from "../utils/fish";
import Menu, { MenuItem } from "../components/Menu";
import { ContainerControls } from './BaseStyles';

const sortId = (a: Fish, b: Fish) => a.tokenId - b.tokenId;
const sortAlpha = (a: Fish, b: Fish) => {
	let bIsAlpha: any = b.seasonStats.fightWins > 0;
	let aIsAlpha: any = a.seasonStats.fightWins > 0;
	return bIsAlpha - aIsAlpha;
}
const sortBetta = (a: Fish, b: Fish) => {
	let bIsBetta: any = b.seasonStats.fightWins === 0;
	let aIsBetta: any = a.seasonStats.fightWins === 0;
	return bIsBetta - aIsBetta;
}
const sortAgi = (a: Fish, b: Fish) => a.agility - b.agility;
const sortStr = (a: Fish, b: Fish) => a.strength - b.strength;
const sortInt = (a: Fish, b: Fish) => a.intelligence - b.intelligence;
const sortWins = (a: Fish, b: Fish) => a.lifetimeWins - b.lifetimeWins;

enum SortSelection {
  "Id",
  "Alpha",
  "Betta",
  "Strength",
  "Intelligence",
  "Agility",
}

type Props = {
  fishCollection: Fish[];
  onClick?: (fish: Fish) => void;
  selectedFish?: Fish | null;
  selectedOpponent?: Fish | null;
  depositFighter?: boolean;
  depositAlpha?: boolean;
	type?: string;
  children?: React.ReactNode;
};

const FishViewer = ({
  fishCollection,
  onClick,
  selectedFish,
  selectedOpponent,
  depositAlpha,
  depositFighter,
	type,
  children
}: Props) => {
  const [showStats, setShowStats] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<number>(SortSelection.Id);
  const [searchId, setSearchId] = useState<string>("");

	useEffect(() => {
		if(type == "Breeding") setSortOption(SortSelection.Betta)
	}, []);

  const SortOptions = [
    {
      name: "Id",
      onClick: () => setSortOption(SortSelection.Id),
      sortFn: sortId,
    },
		{
      name: "Alpha",
      onClick: () => setSortOption(SortSelection.Alpha),
      sortFn: sortAlpha,
    },
		{
      name: "Betta",
      onClick: () => setSortOption(SortSelection.Betta),
      sortFn: sortBetta,
    },
    {
      name: "Strength",
      onClick: () => setSortOption(SortSelection.Strength),
      sortFn: sortStr,
    },
    {
      name: "Intelligence",
      onClick: () => setSortOption(SortSelection.Intelligence),
      sortFn: sortInt,
    },
    {
      name: "Agility",
      onClick: () => setSortOption(SortSelection.Agility),
      sortFn: sortAgi,
    },
  ];

  const scrollRef = useHorizontalScroll();

  return (
    <>
      <ContainerControls>
        {children}
        {fishCollection.length > 0 && (
        <Menu
          name={`Sort by: ${SortSelection[sortOption]}`}
          items={SortOptions}
        ></Menu>
        )}
        {/* <Search>
          <TextLabel>
            VIEW ID:
            <SearchInput
              type="text"
              value={searchId}
              onChange={(ev: React.ChangeEvent<HTMLInputElement>): void =>
                setSearchId(ev.target.value)
              }
            />
          </TextLabel>
          <input type="submit" value="GO" />
        </Search> */}
      </ContainerControls>

      <FishGrid ref={scrollRef}>
        {/* {depositAlpha && <AddButton to="/ocean">Add to Breed Pool</AddButton>}
        {depositFighter && <AddButton to="/ocean">Add to Fight Pool</AddButton>} */}
        {fishCollection
          .sort(SortOptions[sortOption].sortFn)
          ?.map((fish, index) => (
            <FishNFT
							type={type}
              selectedOpponent={selectedOpponent?.tokenId === fish.tokenId}
              selectedUser={selectedFish?.tokenId === fish.tokenId}
              onClick={onClick ? () => onClick(fish) : undefined}
              fish={fish}
              key={index}
            ></FishNFT>
          ))}
      </FishGrid>
    </>
  );
};

interface GridProps {
  ref?: any;
}

const Search = styled.form`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  background-color: #f0f1eb;
  padding: 8px 10px;
  border-radius: 10px;
  margin-left: ${(props) => props.theme.spacing.gapSmall};
  border: 2px solid white;
  color: black;
`;

const SearchInput = styled.input`
  width: 40px;
  margin-left: 5px;
  border: 2px solid black;
  border-radius: 5px;
  padding: 2px;
  font-size: ${(props) => props.theme.font.small};
  text-decoration: none;
  text-transform: uppercase;

  @media ${(props) => props.theme.device.tablet} {
    font-size: ${(props) => props.theme.font.medium};
  }
`;

const TextLabel = styled.label`
  font-size: ${(props) => props.theme.font.small};
  text-decoration: none;
  text-transform: uppercase;
  padding: 0;

  @media ${(props) => props.theme.device.tablet} {
    font-size: ${(props) => props.theme.font.medium};
  }
`;

const FishGrid = styled.div<GridProps>`
  display: flex;
  flex-direction: row nowrap;
  align-items: center;
  /* justify-content: space-between; */
  /* justify-content: space-between; */
  overflow-y: hidden;
  overflow-x: hidden;
  pointer-events: auto;
`;

const SortMenu = styled.div`
  display: flex;
  flex-flow: row nowrap;
  position: absolute;
  bottom: 12vh;
  right: ${(props) => props.theme.spacing.gap};
  /* width: 100px; */
  padding: ${(props) => props.theme.spacing.gap};
  pointer-events: auto;
`;

const AddButton = styled(Link)`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  /* border: 2px solid white; */
  height: 12vh;
  width: 12vh;
  border-radius: 50%;
  border: 2px solid white;
  color: black;
  background-color: #f0f1eb;
  text-align: center;
  /* padding: 10px 24px; */
  font-size: ${(props) => props.theme.font.small};
  text-decoration: none;
  text-transform: uppercase;

  @media ${(props) => props.theme.device.tablet} {
    font-size: ${(props) => props.theme.font.medium};
  }
`;
export default FishViewer;
