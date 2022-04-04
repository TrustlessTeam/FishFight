import styled from "styled-components";
import BN from 'bn.js'
import { useFishFight } from "../context/fishFightContext";
import fishImg from "../img/icons/fish.svg";
import deadImg from "../img/icons/dead.svg";
import foodImg from "../img/icons/food.svg";
import breedingImg from "../img/icons/breeding.svg";
import fightingImg from "../img/icons/fighting.svg";
import eggImg from "../img/icons/FishEgg.png";
import scaleImg from "../img/icons/FishScale.png";
import bloaterImg from "../img/icons/dfk-bloater.png";

import web3 from "web3";

const Balance = () => {
  const {
    balance,
    balanceFish,
    balanceDeadFish,
		balanceFightFish,
    balanceBreedFish,
    balanceFood
  } = useFishFight();

  if (!balance) return null;

  return (
    <>
      <BalanceComponent title="FISHFOOD Balance">
        <BalanceText>
          {parseFloat(balanceFood ? balanceFood : "0").toFixed(2)}
          <LogoImg src={foodImg} alt="FISHFOOD"></LogoImg>
        </BalanceText>
      </BalanceComponent>
      <BalanceComponent title="FISH Balance">
        <BalanceText>
          {balanceFish}
          <LogoImg src={fishImg} alt="FISH"></LogoImg>
        </BalanceText>
      </BalanceComponent>
      <BalanceComponent title="DEADFISH Balance">
        <BalanceText>
          {balanceDeadFish}
          <LogoImg src={deadImg} alt="DEADFISH"></LogoImg>
        </BalanceText>
      </BalanceComponent>

      <BalanceComponent title="FIGHTFISH Balance">
        <BalanceText>
          {balanceFightFish}
          <LogoImg src={fightingImg} alt="FIGHTFISH"></LogoImg>
        </BalanceText>
      </BalanceComponent>
      <BalanceComponent title="BREEDFISH Balance">
        <BalanceText>
          {balanceBreedFish}
          <LogoImg src={breedingImg} alt="BREEDFISH"></LogoImg>
        </BalanceText>
      </BalanceComponent>
    </>
  );
};

export const ItemBalance = () => {
  const {
		balanceFishEgg,
		balanceFishScale,
    balanceBloater,
  } = useFishFight();

  if (!balanceFishEgg || !balanceFishScale || !balanceBloater) return null;

  return (
    <>
			{balanceFishEgg.gt(new BN(0)) &&
				<BalanceComponent title="FISHEGG Balance">
					<BalanceText>
						{web3.utils.fromWei(balanceFishEgg)}
						<LogoImg src={eggImg} alt="FISHEGG"></LogoImg>
					</BalanceText>
				</BalanceComponent>
			}
      {balanceFishScale.gt(new BN(0)) &&
				<BalanceComponent title="FISHSCALE Balance">
					<BalanceText>
						{web3.utils.fromWei(balanceFishScale)}
						<LogoImg src={scaleImg} alt="FISHSCALE"></LogoImg>
					</BalanceText>
				</BalanceComponent>
			}
			{balanceBloater.gt(new BN(0)) &&
				<BalanceComponent title="BLOATER Balance">
					<BalanceText>
						{web3.utils.fromWei(balanceBloater,"wei")}
						<LogoImg src={bloaterImg} alt="BLOATER"></LogoImg>
					</BalanceText>
				</BalanceComponent>
			}
    </>
  );
};


const Balances = styled.div`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  align-items: space-evenly;
  z-index: 5;

  /* @media ${(props) => props.theme.device.tablet} {
	  flex-flow: column;
		align-items: flex-end;
  } */
`;

const BalanceText = styled.b`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  font-size: ${(props) => props.theme.font.medium};
  /* margin-right: ${(props) => props.theme.spacing.gapSmall}; */
  cursor: default;
  @media ${(props) => props.theme.device.tablet} {
    font-size: ${(props) => props.theme.font.medium};
  }
`;

const BalanceComponent = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: center;
  margin-left: ${(props) => props.theme.spacing.gap};
  /* padding: ${(props) => props.theme.spacing.gap} ${(props) =>
    props.theme.spacing.gap}; */
  /* background-color: white; */
  color: white;
  /* border: 2px solid white; */
  border-radius: 50%;

  & > span {
    margin-left: 4px;
  }
`;

const LogoImg = styled.img`
  height: 25px;
  margin-left: ${(props) => props.theme.spacing.gapSmall};

  @media ${(props) => props.theme.device.tablet} {
    height: 30px;
  }
`;

export default Balance;
