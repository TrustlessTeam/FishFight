import styled from 'styled-components';
import { Fish } from '../utils/fish';
import {
  BrowserRouter as Router,
  Route,
  Link,
  NavLink,
  useLocation
} from "react-router-dom";
import { useState } from 'react';

import fishingImg from "../img/icons/fishing.svg"
import breedingImg from "../img/icons/breeding.svg"
import fightingImg from "../img/icons/fighting.svg"
import oceanImg from "../img/icons/ocean.svg"

type Props = {
  fish: Fish;
	onClick?: () => void;
	selectedUser?: boolean;
	selectedOpponent?: boolean;
};

interface ImgProps {
	selectedOpponent?: boolean;
	selectedUser?: boolean;
}

const Nav = () => {

  const location = useLocation().pathname.split('/')[1];
  console.log(location)

	return (
    <NavMenu>
      {/* <BubbleButton to="/ocean"><span>Ocean</span></BubbleButton> */}
      <NavItem>
        <NavImg className={({isActive}) => isActive ? 'active' : ''} to="/ocean">
          <LogoImg src={oceanImg} alt="Ocean"></LogoImg>
        </NavImg>
        <SubContainer>
          <Option className={({isActive}) => isActive ? 'active' : ''} to='/ocean'>Ocean View</Option>
          <Option className={({isActive}) => isActive ? 'active' : ''} to='/ocean/tank'>Tank View</Option>
          <Option className={({isActive}) => isActive ? 'active' : ''} to='/ocean/swim'>Go Swimming!</Option>
        </SubContainer>
      </NavItem>
      <NavItem>
        <NavImg className={({isActive}) => isActive ? 'active' : ''} to="/fishing">
          <LogoImg active={location === 'fishing'} src={fishingImg} alt="Fishing"></LogoImg>
        </NavImg>
        <SubContainer>
          <Option className={({isActive}) => isActive ? 'active' : ''} to='/fishing' end>Fishing Waters</Option>
        </SubContainer>
      </NavItem>
      <NavItem>
        <NavImg className={({isActive}) => isActive ? 'active' : ''} to="/breeding">
          <LogoImg active={location === 'breeding'} src={breedingImg} alt="Breeding"></LogoImg>
        </NavImg>
        <SubContainer>
          <Option className={({isActive}) => isActive ? 'active' : ''} to='/breeding' end>Breeding Waters</Option>
          <Option className={({isActive}) => isActive ? 'active' : ''} to='/breeding/user'>My Breeding Fish</Option>
          <Option className={({isActive}) => isActive ? 'active' : ''} to='/breeding/start'>Breed!</Option>
        </SubContainer>
      </NavItem>
      <NavItem>
        <NavImg className={({isActive}) => isActive ? 'active' : ''} to="/fighting">
          <LogoImg src={fightingImg} alt="Fighting"></LogoImg>
        </NavImg>
        {/* <SubContainer>
          <Option className={({isActive}) => isActive ? 'active' : ''} to='/fighting' end>Fighting Waters</Option>
          <Option className={({isActive}) => isActive ? 'active' : ''} to='/fighting/user'>My Fighting Fish</Option>
          <Option className={({isActive}) => isActive ? 'active' : ''} to='/fighting/start'>FIGHT!</Option>
        </SubContainer> */}
      </NavItem>
      {/* <GameButton to="/fishing"><span>Fishing</span></GameButton> */}
      {/* <GameButton to="/fighting"><span>Fighting</span></GameButton> */}
      {/* <GameButton to="/breeding"><span>Breeding</span></GameButton> */}
    </NavMenu>
	);
};

export default Nav;

interface ActiveProps {
	active?: boolean;
}

const Logo = styled(Link)`
	/* @media ${props => props.theme.device.tablet} {
    display: flex;
		flex-flow: row nowrap;
		justify-content: center;
		align-items: center;
		width: 20%;
  } */
`;

const LogoImg = styled.img<ActiveProps>`
	height: 50px;
	/* border: 2px solid white;s */
	border-radius: 50%;
  &.active {
    background-color: rgba(255, 255, 255, 0.5);
  }

  @media ${props => props.theme.device.tablet} {
		height: 70px;
  }
`;

const NavMenu = styled.nav`
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-evenly;
	align-items: flex-start;
	width: 100%;
	height: 100%;
  pointer-events: auto;

  order: 0;
	@media ${props => props.theme.device.tablet} {
		order: 1;
	  width: 50%;
	  align-items: center;

  }
`;

const NavItem = styled.div`
  /* height: 100%; */
  /* position: relative; */
  display: flex;
  flex-flow: column;
  align-items: center;
  @media ${props => props.theme.device.tablet} {
		height: 100%;
    position: relative;
    display: inline-block;
  }
`;

const SubContainer = styled.div<ActiveProps>`
  display: none;
  flex-flow: column;
  align-items: center;

  @media ${props => props.theme.device.tablet} {
		display: none;
    position: absolute;
    flex-flow: row nowrap;
    border-radius: 20px;
    left: 51%;
    transform: translateX(-51%);
  }
`;

const Option = styled(NavLink)<ActiveProps>`
	color: white;
  padding: ${props => props.theme.spacing.gapSmall};
  display: flex;
  flex-flow: row nowrap;
	font-size: ${props => props.theme.font.medium}vmax;
  white-space: nowrap;
  overflow: hidden;
  text-decoration: none;

  @media ${props => props.theme.device.tablet} {
	  font-size: ${props => props.theme.font.medium}vmin;
  }

  &.active {
    font-weight: bold;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 25px;
  }
`;

const NavImg = styled(NavLink)<ActiveProps>`
  &.active {
    font-weight: bold;
    & > img {
      background-color: rgba(255, 255, 255, 0.5);
    }
    & + div {
      display: flex;
    }
  }
`;
