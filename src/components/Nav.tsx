import styled from 'styled-components';
import {
  NavLink,
  useLocation
} from "react-router-dom";

import fishingImg from "../img/icons/fishing-dark.svg"
import breedingImg from "../img/icons/breeding-dark.svg"
import fightingImg from "../img/icons/fighting-dark.svg"
import oceanImg from "../img/icons/ocean-dark.svg"

const Nav = () => {

  const location = useLocation().pathname.split('/')[1];

	return (
    <NavMenu>
      <NavItem>
        <NavImg className={({isActive}) => isActive ? 'active' : ''} to="/ocean">
          <LogoImg src={oceanImg} alt="Ocean"></LogoImg>
        </NavImg>
      </NavItem>
      <NavItem>
        <NavImg className={({isActive}) => isActive ? 'active' : ''} to="/fishing">
          <LogoImg active={location === 'fishing'} src={fishingImg} alt="Fishing"></LogoImg>
        </NavImg>
      </NavItem>
      <NavItem>
        <NavImg className={({isActive}) => isActive ? 'active' : ''} to="/fighting">
          <LogoImg src={fightingImg} alt="Fighting"></LogoImg>
        </NavImg>
        
      </NavItem>
      <NavItem>
        <NavImg className={({isActive}) => isActive ? 'active' : ''} to="/breeding">
          <LogoImg active={location === 'breeding'} src={breedingImg} alt="Breeding"></LogoImg>
        </NavImg>
      </NavItem>
    </NavMenu>
	);
};

export default Nav;

interface ActiveProps {
	active?: boolean;
}

const LogoImg = styled.img<ActiveProps>`
	height: 35px;

	border-radius: 50%;
  padding: 3px;
  background-image: linear-gradient(#D5D5D5, #D5D5D5);
  box-shadow: inset 2px 2px 2px #c7c7c74b, inset -2px -2px 2px #3f3f3f4c;

  &.active {
    background-color: #038ec5ea;
  }

  @media ${props => props.theme.device.tablet} {
    padding: 10px;
		height: 40px;
  }
`;

const NavMenu = styled.nav`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
  pointer-events: auto;
	@media ${props => props.theme.device.tablet} {
	  align-items: center;
  }
`;

const NavItem = styled.div`
  height: 100%;
  position: relative;
  display: inline-block;
  padding: 0 ${props => props.theme.spacing.gapSmall};
  @media ${props => props.theme.device.tablet} {
		height: 100%;
    position: relative;
    display: inline-block;
    padding: 0 ${props => props.theme.spacing.gapSmall};
  }
`;

const NavImg = styled(NavLink)<ActiveProps>`
  &.active {
    font-weight: bold;
    & > img {
      background-image: linear-gradient(#d5d5d5, #038ec59b);
    }
    & + div {
      display: flex;
    }
  }
`;
