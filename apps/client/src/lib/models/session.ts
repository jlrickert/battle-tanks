import {eq, number, string} from "fp-ts";
import type { StringerT } from "$lib/stringerT";

export type Session = {
	id: string;
	userId: string;
	expiresAt: number;
};

export const make = (args: Session): Session => {
	return {
		id: args.id,
		expiresAt: args.expiresAt,
		userId: args.userId,
	};
};

export const Eq: eq.Eq<Session> = eq.struct<Session>({
	userId: string.Eq,
	id: string.Eq,
	expiresAt: number.Eq,
});

export const Stringer: StringerT<Session> = {
	serialize: JSON.stringify,
	parse: JSON.parse,
};

export const sessionM = { make, Eq, Stringer };
