import type { eq } from "fp-ts";
import type { StringerT } from "$lib/stringerT";
import type { GameState } from "$lib/models/gameState";
import { pipe } from "fp-ts/function";
import { option } from "fp-ts";
import type { Profile } from "$lib/models/profile";

export type Message = UpdateProfileMessage | FastForwardMessage;

type BaseMessage<E extends string, Req, Res> = {
	id: string;
	event: E;
	request: Req;
	response: Res | null;
};

export type UpdateProfileReq = Profile;
export type UpdateProfileRes = {
	useId: string;
	profile: Profile;
};
export type UpdateProfileMessage = BaseMessage<
	"updateProfile",
	UpdateProfileReq,
	UpdateProfileRes
>;

export type FastForwardReq = {
	roomId: string;
};
export type FastForwardRes = {
	state: GameState;
};
export type FastForwardMessage = BaseMessage<
	"fastForward",
	FastForwardReq,
	FastForwardRes
>;

export const Eq: eq.Eq<Message> = { equals: (a, b) => a.id === b.id };

export const Stringer: StringerT<Message> = {
	serialize: JSON.stringify,
	parse: (value) => pipe(JSON.parse(value), option.some),
};

export const respond = <M extends Message>(response: M["response"]) => {
	return (message: M): M => {
		return { ...message, response };
	};
};

export const make = <A extends Message>(message: A): A => message;

export const messageM = { Eq, Stringer, make, respond };
