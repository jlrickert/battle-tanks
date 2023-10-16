import { array, eq, option, string } from "fp-ts";
import { pipe } from "fp-ts/function";
import { lens } from "$lib/funcUtils";
import { type ChatLog, chatLogM } from "$lib/models/chatLog";
import type { StringerT } from "$lib/stringerT";
import type { User } from "$lib/models/user";

export type ChatRoom = {
	id: string;
	name: string;
	userList: string[];
	messages: ChatLog[];
};

export const Eq: eq.Eq<ChatRoom> = eq.struct<ChatRoom>({
	id: string.Eq,
	name: string.Eq,
	messages: array.getEq(chatLogM.Eq),
	userList: array.getEq(string.Eq),
});

export const Stringer: StringerT<ChatRoom> = {
	parse: (item) => {
		return option.some(JSON.parse(item));
	},
	toString: JSON.stringify,
};

export const make = (room: ChatRoom): ChatRoom => ({
	id: room.id,
	name: room.name,
	messages: room.messages,
	userList: room.userList,
});

export const addUser = (user: User | string) => {
	const userId = typeof user === "string" ? user : user.id;
	return (room: ChatRoom): ChatRoom => {
		return pipe(
			room,
			lens.modify("userList", (userList) => {
				return pipe(
					userList,
					array.append(userId),
					array.uniq(string.Eq),
				);
			}),
		);
	};
};

export const removeUser = (user: User | string) => {
	return (room: ChatRoom): ChatRoom => {
		return pipe(
			room,
			lens.modify("userList", (userList) => {
				return pipe(
					userList,
					array.filter((id) => id !== user),
				);
			}),
		);
	};
};

export const addMessage = (log: ChatLog) => {
	return (room: ChatRoom): ChatRoom => {
		return pipe(
			room,
			lens.modify("messages", (messages) => {
				return pipe(messages, array.append(log));
			}),
		);
	};
};

export const lastMessages = (count: number) => {
	return (room: ChatRoom): ChatLog[] => {
		return pipe(room, lens.get("messages"), array.takeRight(count));
	};
};

export const chatRoomM = {
	make,
	removeUser,
	addUser,
	addMessage,
	lastMessages,
	Eq,
	Stringer,
};
