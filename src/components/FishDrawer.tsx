import React from "react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import { Fish } from "../utils/fish";
import { LeftArrow, RightArrow } from "../scrolling/arrows";
import useDrag from "../scrolling/useDrag";
import { useState } from "react";
import styled from "styled-components";
import FishNFT from "./FishNFT";
import Menu from "../components/Menu";
import { ContainerControls } from './BaseStyles';
import useSound from "use-sound";
import { useFishPool, PoolFish, PoolTypes } from "../context/fishPoolContext";
import { useFishFight } from "../context/fishFightContext";
import web3 from 'web3';

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
  fishPool?: PoolFish;
  poolType?: PoolTypes;
  buffModal?: () => void;
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
  buffModal,
  children,
  fishPool,
  poolType
}: Props) => {

  // NOTE: for drag by mouse
  const { dragStart, dragStop, dragMove, dragging } = useDrag();
  const { loadingFish, loadingUserFish, loadMoreFish } = useFishPool();
  const { balanceFish, balanceFightFish, balanceBreedFish, totalSupply, globalMute, fightingWatersSupply, breedingWatersSupply } = useFishFight();
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

  const [playSplash] = useSound('splash.ogg', {volume: 0.25});
  const [playSplash2] = useSound('splash2.ogg', {volume: 0.25});

  const playSound = () => {
    const rand = Math.floor(Math.random() * 2) + 1
    if(rand === 1) {

      if (!globalMute)
      { playSplash();}
    } else {
      if (!globalMute)
      { playSplash2();}

    }
  }

  const SortOptions = [
    {
      name: "Id",
      id: SortSelection.Id,
      onClick: () => setSortOption(SortSelection.Id),
      sortFn: sortId,
    },
    {
      name: "Rarity",
      id: SortSelection.Rarity,
      onClick: () => setSortOption(SortSelection.Rarity),
      sortFn: sortRarity,
    },
		{
      name: "Alpha",
      id: SortSelection.Alpha,
      onClick: () => setSortOption(SortSelection.Alpha),
      sortFn: sortAlpha,
    },
		{
      name: "Betta",
      id: SortSelection.Betta,
      onClick: () => setSortOption(SortSelection.Betta),
      sortFn: sortBetta,
    },
    {
      name: "Strength",
      id: SortSelection.Strength,
      onClick: () => setSortOption(SortSelection.Strength),
      sortFn: sortStr,
    },
    {
      name: "Intelligence",
      id: SortSelection.Intelligence,
      onClick: () => setSortOption(SortSelection.Intelligence),
      sortFn: sortInt,
    },
    {
      name: "Agility",
      id: SortSelection.Agility,
      onClick: () => setSortOption(SortSelection.Agility),
      sortFn: sortAgi,
    },
    {
      name: "Wins",
      id: SortSelection.Wins,
      onClick: () => setSortOption(SortSelection.Wins),
      sortFn: sortWins,
    },
    {
      name: "Strongest",
      id: SortSelection.Strongest,
      onClick: () => setSortOption(SortSelection.Strongest),
      sortFn: sortStrong,
    },
  ];

  const handleItemClick = (fish: Fish) => () => {
    if (dragging) {
      return false;
    }
    setSelected(selected !== fish.tokenId ? fish.tokenId : 0);
    if (!globalMute)
    { playSound();}

    if(onClick) onClick(fish);
  };

  const loadMore = (index: number) => {
    let numLoaded = fishCollection.length;
    if(index === numLoaded) { // check if we are showing the last item
      
      if(fishPool === PoolFish.Ocean && numLoaded < totalSupply) loadMoreFish(PoolFish.Ocean);
      if(fishPool === PoolFish.User && balanceFish && balanceFightFish && balanceBreedFish) {
        const userTotal = web3.utils.toNumber(balanceFish) + web3.utils.toNumber(balanceFightFish) + web3.utils.toNumber(balanceBreedFish)
        if(fishCollection.length < userTotal) loadMoreFish(PoolFish.User);
      }
      if(fishPool === PoolFish.Breeding && breedingWatersSupply && fishCollection.length < web3.utils.toNumber(breedingWatersSupply)) loadMoreFish(PoolFish.Breeding);
      if(fishPool === PoolFish.Fighting && fightingWatersSupply && fishCollection.length < web3.utils.toNumber(fightingWatersSupply)) loadMoreFish(PoolFish.Fighting);
    }
  }

  const checkAllLoaded = () => {
    let numLoaded = fishCollection.length;
    if(fishPool === PoolFish.Ocean && numLoaded === totalSupply) return true;
    if(fishPool === PoolFish.User && balanceFish && balanceFightFish && balanceBreedFish) {
      const userTotal = web3.utils.toNumber(balanceFish) + web3.utils.toNumber(balanceFightFish) + web3.utils.toNumber(balanceBreedFish);
      return fishCollection.length === userTotal;
    }
    if(fishPool === PoolFish.Breeding && breedingWatersSupply && fishCollection.length === web3.utils.toNumber(breedingWatersSupply)) return true;
    if(fishPool === PoolFish.Fighting && fightingWatersSupply && fishCollection.length === web3.utils.toNumber(fightingWatersSupply)) return true;

    return false;
  }

  return (
    <>
      <PendingOverlay open={loadingFish || loadingUserFish} className={loadingFish || loadingUserFish ? "active" : ""}>
          <div className="lds-ripple"><div></div><div></div></div>
          <LoadingText>Loading Fish...</LoadingText>
        </PendingOverlay>
      <ContainerControls>
        {children}
        {fishCollection.length > 0 && (
        <Menu
          name={`Sort by: ${SortSelection[sortOption]}`}
          items={SortOptions}
        ></Menu>
        )}
      </ContainerControls>

      <Container>
        <div onMouseLeave={dragStop}>
          <StyledScrollMenu
            LeftArrow={LeftArrow}
            RightArrow={<RightArrow loadMore={loadMore} allLoaded={checkAllLoaded()} />}
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
                fishPool={fishPool}
                poolType={poolType}
                itemId={(index + 1).toString()} // NOTE: itemId is required for track items
                key={fish.tokenId}
                selectedOpponent={selectedOpponent?.tokenId === fish.tokenId}
                selectedUser={selectedFish?.tokenId === fish.tokenId}
                onClick={onClick ? handleItemClick(fish) : undefined}
                buffModal={buffModal}
              />
            ))}
          </StyledScrollMenu>
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

const StyledScrollMenu = styled(ScrollMenu)`


`;

const Container = styled.div`
  pointer-events: auto;
  overflow-x: hidden;

	.react-horizontal-scrolling-menu--scroll-container  {
		overflow-x: hidden;

		.react-horizontal-scrolling-menu--item  {

		  &:first-child {
		    padding-left: 30px;
		  }

		  &:last-child {
		    padding-right: 30px;
		  }
		}
	}
`;

const PendingOverlay = styled.div<{open: boolean}>`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease-in-out;

  &.active {
    pointer-events: auto;
    opacity: 1;
    height: 120px;
  }
`;

const LoadingText = styled.h1`
  color: white;
  margin: 0 auto;
`;
