import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { faRing } from '@fortawesome/free-solid-svg-icons';
import { faDragon } from '@fortawesome/free-solid-svg-icons';
import { faDungeon } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faMap } from '@fortawesome/free-solid-svg-icons';
import { faPlaceOfWorship } from '@fortawesome/free-solid-svg-icons';

export const TYPES = {
	Location: "Location",
	Building: "Building",
	PC: "Player character",
	NPC: "Non-playable character",
	Monster: "Monster",
	Group: "Group",
	Quest: "Quest",
	Item: "Item",
	Other: "Other",
};

export const ICONS = {
	Location: faMap,
	Building: faPlaceOfWorship,
	PC: faUser,
	NPC: faUserCircle,
	Monster: faDragon,
	Group: faUsers,
	Quest: faExclamationCircle,
	Item: faRing,
	Other: faDungeon,
};