import type { ChatRoom } from "$lib/models/chatRoom";
import { createRepo } from "$lib/server/storage/repo";
import type { Option } from "fp-ts/Option";
import type { User } from "$lib/models/user";
import type { ChatLog } from "$lib/models/chatLog";
import type { Filter, InsertOneResult, UpdateResult } from "mongodb";

export type ChatRoomRepo = {
	create: (room: ChatRoom) => Promise<InsertOneResult<ChatRoom>>;
	getRoom: (id: string) => Promise<Option<ChatRoom>>;
	find: (filter: Filter<ChatRoom>) => Promise<readonly ChatRoom[]>;
	joinRoom: (args: {
		roomId: string;
		user: User | string;
	}) => Promise<UpdateResult<ChatRoom>>;
	leaveRoom: (args: {
		roomId: string;
		user: User | string;
	}) => Promise<UpdateResult<ChatRoom>>;
	sendMessage: (args: {
		log: ChatLog;
		roomId: string;
	}) => Promise<UpdateResult<ChatRoom>>;
};

export const createChatRoomRepo = (): ChatRoomRepo => {
	const repo = createRepo<ChatRoom>("chatRooms");
	return {
		create: async (room) => {
			const r = await repo;
			return await r.insert(room);
		},
		getRoom: async (id) => {
			const r = await repo;
			return r.findOne({ id });
		},
		find: async (filter) => {
			const r = await repo;
			return r.find(filter);
		},
		joinRoom: async ({ roomId, user }) => {
			const userId = typeof user === "string" ? user : user.id;
			const r = await repo;
			return await r.updateOne(
				{ id: roomId },
				{ $addToSet: { userList: userId } },
			);
		},
		leaveRoom: async ({ roomId, user }) => {
			const userId = typeof user === "string" ? user : user.id;
			const r = await repo;
			return r.updateOne({ id: roomId }, { $pull: { userList: userId } });
		},
		sendMessage: async ({ roomId, log }) => {
			const r = await repo;
			return r.updateOne({ id: roomId }, { $push: { messages: log } });
		},
	};
};
