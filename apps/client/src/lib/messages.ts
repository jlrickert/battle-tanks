import type { User } from "$lib/sessions";

export type BaseMessage<E extends string, A> = {
	id: string;
	event: E;
	data: A;
};

export type Message = ProfileMessage | FastForwardMessage;

export const parseMessage = (data: BufferLike) => {
	const value = data.toString();
	return JSON.parse(value) as Message;
};

export const createMessage = (msg: Message): Message => msg;

export type ProfileMessage = BaseMessage<"profile", User>;

export type RegisterMessage = BaseMessage<
	"register",
	{
		name: string;
		userId: string;
	}
>;

export type FastForwardMessage = BaseMessage<
	"fastForward",
	{
		response?: {
			currentUserId: string;
			users: { [userId: string]: User };
		};
	}
>;
