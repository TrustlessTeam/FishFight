
import styled from "styled-components";
import useSound from 'use-sound';

import { useFishFight } from "../context/fishFightContext";

// type Props = {
//   onClick: () => void;
//   children?: React.ReactNode;
//   disabled?: boolean;
//   style?: object;
// }

type Props = {
  items: ToggleItem[],
	selected: number
}

export type ToggleItem = {
  name: string;
	id: number;
  onClick: () => void;
  // extra?: any;
};

const ToggleButton = ({ items, selected } : Props) => {
	const [playClick] = useSound('click.wav', {volume: 0.075});

	const { globalMute } = useFishFight();

	return (
		<>
			<ToggleGroup>
				{items.map((item, key) => {
					return(
						<ToggleOption key={key} className={selected === item.id ? 'active' : ''} 
						onClick={
							() => {
								if ( !globalMute )
								{
									item.onClick(); 
								}
								playClick();
							}}>{item.name}</ToggleOption>
					)
				})}
				{/* <ToggleOption className={selected === FishView.Ocean ? 'active' : ''} onClick={() => setFishToShow(FishView.Ocean)}>Ocean Fish</ToggleOption>
				<ToggleOption className={selected === FishView.User ? 'active' : ''} onClick={() => setFishToShow(FishView.User)}>My Fish</ToggleOption> */}
			</ToggleGroup>
			{/* <Menu name={FishView[fishToShow]} items={FishViewOptions}></Menu> */}
		</>
	)
}

export default ToggleButton;


export const ToggleGroup = styled.div`
	display: flex;
	flex-flow: row nowrap;
	/* box-shadow: 2px 2px 8px 2px gray, -2px -2px 8px 2px white; */
	pointer-events: auto;

	border-radius: 10px;
	&:after {
		content: "";
		clear: both;
		display: table;
	}
`;

export const ToggleOption = styled.button`
	position: relative;
	background-color: #f0f1eb;
  /* border: 2px solid white; */
	border: none;
  color: white;
  padding: 6px 20px;
  cursor: pointer;
  float: left;
	color: black;
	font-size: ${props => props.theme.font.small};
	text-transform: uppercase;
	background-image: linear-gradient(#ffffff, #adadad);
  z-index: 1;
  box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .3), inset -2px -2px 2px rgba(0, 0, 0, .3);
  transition: all 0.25s ease-in-out;

	&:first-child {
		border-top-left-radius: 10px;
		border-bottom-left-radius: 10px;
	}

	&:last-child {
		border-top-right-radius: 10px;
		border-bottom-right-radius: 10px;
	}

	&:not(:last-child) {
		border-right: none; /* Prevent double borders */
	}

	&:hover {
		background-image: linear-gradient(#ffffff, #e2e2e2);
		transition: all 0.25s ease-in-out;

		&:first-child {
			&::before {
				position: absolute;
				content: "";
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				border: none;
				color: white;
				padding: 6px 20px;
				cursor: pointer;
				float: left;
				background-image: linear-gradient(#ffffff, #e2e2e2);
				box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .3), inset 2px -2px 2px rgba(0, 0, 0, .3);
				transition: all 0.25s ease-in-out;
				z-index: -1;
				transition: opacity 0.25s ease-in-out;
				opacity: 0;
				border-top-left-radius: 10px;
				border-bottom-left-radius: 10px;
			}
			
		}

		&:last-child {
			border-top-right-radius: 10px;
			border-bottom-right-radius: 10px;
  		transition: all 0.25s ease-in-out;

			&::before {
				position: absolute;
				content: "";
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				border: none;
				color: white;
				padding: 6px 20px;
				cursor: pointer;
				float: left;
				background-image: linear-gradient(#ffffff, #e2e2e2);
				box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .3), inset -2px -2px 2px rgba(0, 0, 0, .3);

				z-index: -1;
				transition: opacity 0.25s ease-in-out;
				opacity: 0;
				border-top-right-radius: 10px;
				border-bottom-right-radius: 10px;
			}
		}

		&:not(:last-child) {
			border-right: none; /* Prevent double borders */
		}
	}

	&.active {
		background-image: linear-gradient(#ffffff, #e2e2e2);
		box-shadow: inset 0 0 5px #000;
		pointer-events: none;

		/* &:hover {
			background-image: linear-gradient(#ffffff, #e2e2e2);

		}
		&:first-child {
			border-top-left-radius: 10px;
			border-bottom-left-radius: 10px;
		}

		&:last-child {
			border-top-right-radius: 10px;
			border-bottom-right-radius: 10px;
		}

		&:not(:last-child) {
			border-right: none; /* Prevent double borders */
		} */
	}

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
		padding: 10px 24px;
  }

	&:hover {
		cursor: pointer;
	}

  
  
  &:hover::before {
    opacity: 1;
		&:first-child {
			border-top-left-radius: 10px;
			border-bottom-left-radius: 10px;
		}

		&:last-child {
			border-top-right-radius: 10px;
			border-bottom-right-radius: 10px;
		}

		&:not(:last-child) {
			border-right: none; /* Prevent double borders */
		}
  }
`;