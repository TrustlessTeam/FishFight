import styled from 'styled-components';
import { Fish } from '../utils/fish';
import {
  BrowserRouter as Router,
  Switch,
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
        <Link to="/ocean">
          <LogoImg active={location === 'ocean'} src={oceanImg} alt="Ocean"></LogoImg>
        </Link>
        <SubContainer active={location === 'ocean' || location === 'ocean-tank'}>
          <Option active={location === 'ocean-tank'} to='/ocean-tank'>Tank View</Option>
          <Option active={location === 'ocean-swim'} to='/ocean-swim'>Go Swimming!</Option>
        </SubContainer>
      </NavItem>
      <NavItem>
        <Link to="/fishing">
          <LogoImg active={location === 'fishing'} src={fishingImg} alt="Fishing"></LogoImg>
        </Link>
      </NavItem>
      <NavItem>
        <Link to="/breeding">
          <LogoImg active={location === 'breeding'} src={breedingImg} alt="Breeding"></LogoImg>
        </Link>
      </NavItem>
      <NavItem>
        <Link to="/fighting">
          <LogoImg active={location === 'fighting' || location === 'fighting-user'} src={fightingImg} alt="Fighting"></LogoImg>
        </Link>
        <SubContainer active={location === 'fighting' || location === 'fighting-user'}>
          <Option active={location === 'fighting'} to='/fighting'>Fighting Waters</Option>
          <Option active={location === 'fighting-user'} to='/fighting-user'>My Fighting Fish</Option>
        </SubContainer>
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
	height: 100%;
	border: 3px solid white;
	border-radius: 50%;
  background-color: ${props => props.active ? "rgba(255, 255, 255, 0.5);" : "rgba(255, 255, 255, 0);"};
`;

const NavMenu = styled.nav`
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-evenly;
	align-items: center;
	width: 100%;
	height: 100%;
  pointer-events: auto;
`;

const NavItem = styled.div`
  height: 100%;
  position: relative;
  display: inline-block;
`;

const SubContainer = styled.div<ActiveProps>`
  display: ${props => props.active ? "flex" : "none"};
  position: absolute;
  flex-flow: row nowrap;
  /* background-color: rgba(255, 255, 255, 0.5); */
	border: 3px solid white;

  border-radius: 20px;
  left: 51%;
  transform: translateX(-51%);
`;

const Option = styled(Link)<ActiveProps>`
	color: white;
  font-weight: ${props => props.active ? "bold" : "nomral"};
  margin: ${props => props.theme.spacing.gapSmall};
  display: flex;
  flex-flow: row nowrap;
  white-space: nowrap;
  overflow: hidden;
`;
