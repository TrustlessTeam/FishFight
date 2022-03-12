import { BaseButtonStyle } from "./BaseStyles";
import useSound from 'use-sound';
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { VisibilityContext } from "react-horizontal-scrolling-menu";


type Props = {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  style?: object;
  className?: string; 
  itemId: string;
  to: string;
}



const DrawerButton = ({onClick, children, style, to, className, itemId} : Props) => {
  const [playClick] = useSound('click.wav', {volume: 0.25});

  const visibility = useContext(VisibilityContext);

  const visible = visibility.isItemVisible(itemId);
	
	return (
    <FishContainer
    tabIndex={0}
    role="bottom"
    >
      <FishDrawerButton
        onClick={() => {if(onClick != null) onClick(); playClick();}}
        // disabled={disabled}
        style={style}
        className={className}
        // itemId
        to={to}
      >
        {children}
      </FishDrawerButton>
    </FishContainer>
    
  );
};

export default DrawerButton;

const FishContainer = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: center;
  margin: 0 ${(props) => props.theme.spacing.gapSmall};
`;

export const FishDrawerButton = styled(Link)`
	display: flex;
	flex-flow: column;
	justify-content: center;
	align-items: center;
	height: 100px;
	width: 100px;
	border-radius: 50%;
	cursor: pointer;
	position: relative;

	color: black;

  text-align: center;
  /* padding: 10px 20px; */
	font-size: ${props => props.theme.font.small};
  text-decoration: none;
  text-transform: uppercase;

  background-image: linear-gradient(#ffffff, #adadad);
  z-index: 1;
  box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .3), inset -2px -2px 2px rgba(0, 0, 0, .3);
  /* transition: transform 0.25s ease-in-out; */

  @media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
    height: 120px;
		width: 120px;
  }

  &:hover {
		cursor: pointer;
	}

  &::before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
		height: 100px;
		width: 100px;
    border-radius: 50%;
    background-image: linear-gradient(#ffffff, #e2e2e2);
    z-index: -1;
    transition: opacity 0.25s ease-in-out;
    opacity: 0;
		@media ${props => props.theme.device.tablet} {
			font-size: ${props => props.theme.font.medium};
			height: 120px;
			width: 120px;
  }
  }
  
  &:hover::before {
    opacity: 1;
  }

	&:active {
		transform: scale(0.8);
	}
`;