import React from "react";

import { VisibilityContext } from "react-horizontal-scrolling-menu";
import styled from "styled-components";
import BaseButton from "../components/BaseButton";
import { useFishPool } from "../context/fishPoolContext";

function Arrow({
  children,
  disabled,
  onClick,
  left
}: {
  children: React.ReactNode;
  disabled: boolean;
  left: boolean;
  onClick: VoidFunction;
}) {
  return (
    <ArrowContainer
    style={left ?
      {
        opacity: disabled ? "0" : "1",
        left: "0"
      }
      :
      {
        opacity: disabled ? "0" : "1",
        right: "0"
      }
    }>
      <ArrowButton
        disabled={disabled}
        onClick={onClick}

      >
        {children}
      </ArrowButton>
    </ArrowContainer>

  );
}

export function LeftArrow() {
  const {
    isFirstItemVisible,
    scrollPrev,
    visibleItemsWithoutSeparators,
    initComplete
  } = React.useContext(VisibilityContext);

  const [disabled, setDisabled] = React.useState(
    !initComplete || (initComplete && isFirstItemVisible)
  );
  React.useEffect(() => {
    // NOTE: detect if whole component visible
    if (visibleItemsWithoutSeparators.length) {
      setDisabled(isFirstItemVisible);
    }
  }, [isFirstItemVisible, visibleItemsWithoutSeparators]);

  return (
    <Arrow left={true} disabled={disabled} onClick={() => scrollPrev()}>
      {'<'}
    </Arrow>
  );
}

export function RightArrow({
  loadMore
}: {
  loadMore: (index: number) => void;
}) {
  const {
    isLastItemVisible,
    scrollNext,
    visibleItemsWithoutSeparators
  } = React.useContext(VisibilityContext);

  const { loadingUserFish, loadingFish } = useFishPool();

  const [disabled, setDisabled] = React.useState(
    true
  );
  React.useEffect(() => {
    if (visibleItemsWithoutSeparators.length) {
      console.log(visibleItemsWithoutSeparators)
      console.log(isLastItemVisible)
      const [lastItem] = visibleItemsWithoutSeparators.slice(-1)
      let lastShowingTokenId = parseInt(lastItem)
      // if(isLastItemVisible && lastItem === oceanFish)
      
      if(!loadingFish && !loadingUserFish) {
        console.log(lastShowingTokenId)
        loadMore(lastShowingTokenId)
        // setDisabled(true);

      }
      setDisabled(false);
      // loadMoreFish(0);
    }
  }, [isLastItemVisible, visibleItemsWithoutSeparators]);

  return (
    <Arrow left={false} disabled={disabled} onClick={() => scrollNext()}>
      {'>'}
    </Arrow>
  );
}

const ArrowContainer = styled.div`
  position: absolute;
  bottom: 25px;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  @media ${props => props.theme.device.tablet} {
		bottom: 40px;
  }
`;

const ArrowButton = styled(BaseButton)`
  cursor: pointer;
  right: 1%;
  user-select: none;
  font-size: 30px;
  font-weight: bold;
  padding: 0px 10px;
  margin: 5px;
  /* height: 20px; */
  @media ${props => props.theme.device.tablet} {
		font-size: 40px;
  }
`;
