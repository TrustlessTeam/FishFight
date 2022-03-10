import React, { useEffect, useRef } from "react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import { Fish } from "../utils/fish";

import { LeftArrow, RightArrow } from "../scrolling/arrows";


import useDrag from "../scrolling/useDrag";
import { useState } from "react";
import styled from "styled-components";
import FishNFT from "./FishNFT";
import Menu from "../components/Menu";
import { ContainerControls } from './BaseStyles';
import usePrevious from "../scrolling/usePrevious";


const sortId = (a: Fish, b: Fish) => a.tokenId - b.tokenId;
const sortAlpha = (a: Fish, b: Fish) => {
	let bIsAlpha: any = b.fishModifiers.alphaModifier.uses > 0;
	let aIsAlpha: any = a.fishModifiers.alphaModifier.uses > 0;
	return bIsAlpha - aIsAlpha;
}
const sortBetta = (a: Fish, b: Fish) => {
	let bIsBetta: any = b.fishModifiers.alphaModifier.uses === 0;
	let aIsBetta: any = a.fishModifiers.alphaModifier.uses === 0;
	return bIsBetta - aIsBetta;
}
const sortAgi = (a: Fish, b: Fish) => {return b.agility - a.agility};
const sortStr = (a: Fish, b: Fish) => {return b.strength - a.strength};
const sortInt = (a: Fish, b: Fish) => {return b.intelligence - a.intelligence};
const sortWins = (a: Fish, b: Fish) => {return b.lifetimeWins - a.lifetimeWins};
const sortRarity = (a: Fish, b: Fish) => {return a.rarity - b.rarity};
const sortStrong = (a: Fish, b: Fish) => {return (b.agility + b.intelligence + b.strength) - (a.agility + a.intelligence + a.strength)};


enum SortSelection {
  "Id",
  "Rarity",
  "Alpha",
  "Betta",
  "Strength",
  "Intelligence",
  "Agility",
  "Wins",
  "Strongest",
}

type scrollVisibilityApiType = React.ContextType<typeof VisibilityContext>;

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

const FishDrawer = ({
  fishCollection,
  onClick,
  selectedFish,
  selectedOpponent,
  depositAlpha,
  depositFighter,
	type,
  children
}: Props) => {

  // NOTE: for drag by mouse
  const { dragStart, dragStop, dragMove, dragging } = useDrag();
  const handleDrag = ({ scrollContainer }: scrollVisibilityApiType) => (
    ev: React.MouseEvent
  ) =>
    dragMove(ev, (posDiff: any) => {
      if (scrollContainer.current) {
        scrollContainer.current.scrollLeft += posDiff;
      }
    });

  const [selected, setSelected] = React.useState<number>(0);
  const [sortOption, setSortOption] = useState<number>(SortSelection.Id);

  // useEffect(() => {
	// 	if(type == "Breeding") setSortOption(SortSelection.Betta)
	// }, []);
  
  const SortOptions = [
    {
      name: "Id",
      onClick: () => setSortOption(SortSelection.Id),
      sortFn: sortId,
    },
    {
      name: "Rarity",
      onClick: () => setSortOption(SortSelection.Rarity),
      sortFn: sortRarity,
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
    {
      name: "Wins",
      onClick: () => setSortOption(SortSelection.Wins),
      sortFn: sortWins,
    },
    {
      name: "Strongest",
      onClick: () => setSortOption(SortSelection.Strongest),
      sortFn: sortStrong,
    },
  ];

  const handleItemClick = (fish: Fish) => () => {
    if (dragging) {
      return false;
    }
    setSelected(selected !== fish.tokenId ? fish.tokenId : 0);
    if(onClick) onClick(fish);
  };

  // const selectedPrev = usePrevious(selected);
  // const apiRef = useRef({} as scrollVisibilityApiType);
  // useEffect(() => {
  //   if(selected !== selectedPrev) {
  //     const item = apiRef.current?.getItemElementById(selected);
  //     if(item != null) {
  //       apiRef.current?.scrollToItem?.(
  //         // document.querySelector(`[data-key='${items.slice(-1)?.[0]?.id}']`)
  //         item
  //       );
  //     }
  //   }
    
  // }, [selected, selectedPrev]);

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
      <Container>
        <div onMouseLeave={dragStop}>
          <ScrollMenu
            LeftArrow={LeftArrow}
            RightArrow={RightArrow}
            onWheel={onWheel}
            onMouseDown={() => dragStart}
            onMouseUp={() => dragStop}
            onMouseMove={handleDrag}
          >
            {fishCollection.sort((a: Fish, b: Fish) => SortOptions[sortOption].sortFn(a, b))
              .map((fish, index) => (
              <FishNFT
                type={type}
                fish={fish}
                itemId={fish.tokenId.toString()} // NOTE: itemId is required for track items
                key={fish.tokenId}
                selectedOpponent={selectedOpponent?.tokenId === fish.tokenId}
                selectedUser={selectedFish?.tokenId === fish.tokenId}
                onClick={onClick ? handleItemClick(fish) : undefined}
              />
            ))}
          </ScrollMenu>
        </div>
      </Container>

    </>
    
  );
}
export default FishDrawer;

function onWheel(apiObj: scrollVisibilityApiType, ev: React.WheelEvent): void {
  const isThouchpad = Math.abs(ev.deltaX) !== 0 || Math.abs(ev.deltaY) < 15;

  if (isThouchpad) {
    ev.stopPropagation();
    return;
  }

  if (ev.deltaY < 0) {
    apiObj.scrollNext();
  } else if (ev.deltaY > 0) {
    apiObj.scrollPrev();
  }
}

const Container = styled.div`
  pointer-events: auto;
  overflow-x: hidden;

  .react-horizontal-scrolling-menu--scroll-container {
    overflow-x: hidden;
  }
`;