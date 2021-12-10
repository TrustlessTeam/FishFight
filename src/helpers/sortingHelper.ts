import { Fish } from "../utils/fish";


export 	const sortId = (a: Fish, b: Fish) => a.tokenId - b.tokenId;

export 	const sortAgi = (a: Fish, b: Fish) => a.agility - b.agility;
export 	const sortStr = (a: Fish, b: Fish) => a.strength - b.strength;
export 	const sortInt = (a: Fish, b: Fish) => a.intelligence - b.intelligence;

export 	const sortWins = (a: Fish, b: Fish) => a.lifetimeWins - b.lifetimeWins;


export const SortOptions = {
	"Id": {
		name: "Id",
		sortFn: sortId
	},
	"Strength": {
		name: "Strength",
		sortFn: sortStr
	},
	"Agility": {
		name: "Agility",
		sortFn: sortAgi
	},
	"Intelligence": {
		name: "Intelligence",
		sortFn: sortInt
	}
}