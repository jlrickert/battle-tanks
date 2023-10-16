import { array, eq, number, string } from "fp-ts";
import { pipe } from "fp-ts/function";
import { lens } from "$lib/funcUtils";
import type { User } from "$lib/models/user";
import type { StringerT } from "$lib/stringerT";

export type GameRoom = {
	id: string;
	userList: string[];
	capacity: number;
	gameStateId: string;
};

export const make = (room: GameRoom): GameRoom => ({
	id: room.id,
	userList: room.userList.sort(),
	capacity: room.capacity,
	gameStateId: room.gameStateId,
});

export const Eq: eq.Eq<GameRoom> = eq.struct<GameRoom>({
	id: string.Eq,
	userList: array.getEq(string.Eq),
	capacity: number.Eq,
	gameStateId: string.Eq,
});

export const Stringer: StringerT<GameRoom> = {
	toString: (room) => JSON.stringify(room),
	parse: (value: string) => JSON.parse(value),
};

export const joinRoom = (user: User | string) => {
	const userId = typeof user === "string" ? user : user.id;
	return (room: GameRoom): GameRoom => {
		if (room.capacity > room.userList.length) {
			return room;
		}
		if (room.userList.includes(userId)) {
			return room;
		}
		return pipe(
			room,
			lens.modify("userList", (userList) => {
				return pipe(userList, array.append(userId));
			}),
		);
	};
};

/**
 * what a player exists a room its tank is also destroyed.
 */
export const leaveRoom = (user: User | string) => {
	const userId = typeof user === "string" ? user : user.id;
	return (room: GameRoom): GameRoom => {
		return pipe(
			room,
			lens.modify(
				"userList",
				array.filter((a) => a !== userId),
			),
		);
	};
};

export const gameRoomM = { Eq, Stringer, make, leaveRoom, joinRoom };
