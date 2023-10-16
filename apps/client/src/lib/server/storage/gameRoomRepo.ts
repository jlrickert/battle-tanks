import { createRepo } from "$lib/server/storage/repo";
import type { GameRoom } from "$lib/models/gameRoom";
import type { User } from "$lib/models/user";
import type { Option } from "fp-ts/Option";
import type { Filter, InsertOneResult, UpdateResult } from "mongodb";
import { concatUpdateResult } from "$lib/server/storage/mongo";

export type GameRoomRepo = {
	create: (room: GameRoom) => Promise<InsertOneResult<GameRoom>>;
	getRoom: (id: string) => Promise<Option<GameRoom>>;
	getRooms: (filter: Filter<GameRoom>) => Promise<readonly GameRoom[]>;
	/**
	 * Join a room. This also leaves all the rooms that a user is connected too.
	 * @param args
	 */
	joinRoom: (args: {
		roomId: string;
		user: User | string;
	}) => Promise<UpdateResult<GameRoom>>;
	leaveAll: (user: User | string) => Promise<UpdateResult<GameRoom>>;
};

export const createGameRoomRepo = (): GameRoomRepo => {
	const repo = createRepo<GameRoom>("gameRooms");

	const leaveAll: GameRoomRepo["leaveAll"] = async (user) => {
		const userId = typeof user === "string" ? user : user.id;
		const r = await repo;
		return r.updateMany({}, { $pull: { userList: userId } });
	};
	return {
		create: async (room) => {
			const r = await repo;
			return r.insert(room);
		},
		getRoom: async (roomId) => {
			const r = await repo;
			return r.findOne({ id: roomId });
		},
		getRooms: async (filter) => {
			const r = await repo;
			return r.find(filter);
		},
		joinRoom: async ({ roomId, user }) => {
			const userId = typeof user === "string" ? user : user.id;
			const r = await repo;
			const a = await leaveAll(user);
			const b = await r.updateOne(
				{ id: roomId },
				{ $addToSet: { userList: userId } },
			);
			return concatUpdateResult(a, b);
		},
		leaveAll,
	};
};
