import { eq, option, string } from "fp-ts";
import { pipe } from "fp-ts/function";
import type { StringerT } from "$lib/stringerT";

export type ChatLog = {
	id: string;
	creator: string;
	data: string;
};

export const make = (log: ChatLog): ChatLog => ({
	id: log.id,
	creator: log.creator,
	data: log.data,
});

export const Eq: eq.Eq<ChatLog> = eq.struct<ChatLog>({
	id: string.Eq,
	data: string.Eq,
	creator: string.Eq,
});

export const Stringer: StringerT<ChatLog> = {
	toString: (item) => JSON.stringify(item),
	parse: (value) => pipe(JSON.parse(value), (a: ChatLog) => option.of(a)),
};

export const chatLogM = { make, Eq, Stringer };
