import crypto from "crypto";
import { nanoid } from "nanoid";
import { pipe } from "fp-ts/function";
import { eq, number, option, string } from "fp-ts";
import { type Constructor, lens } from "$lib/funcUtils";
import { colorM } from "$lib/models/color";
import type { StringerT } from "$lib/stringerT";
import { type Profile, profileM } from "$lib/models/profile";

export type User = RegularUser | AnonymousUser;

export const Eq: eq.Eq<User> = {
	equals: (a, b) => {
		if (isRegularUser(a) && isRegularUser(b)) {
			eq.struct<RegularUser>({
				profile: profileM.Eq,
				createdAt: number.Eq,
				updatedAt: number.Eq,
				type: string.Eq,
				id: string.Eq,
				name: string.Eq,
				password: string.Eq,
			}).equals(a, b);
		}
		if (isAnonymousUser(a) && isAnonymousUser(b)) {
			eq.struct<AnonymousUser>({
				profile: profileM.Eq,
				createdAt: number.Eq,
				updatedAt: number.Eq,
				type: string.Eq,
				id: string.Eq,
			}).equals(a, b);
		}
		return false;
	},
};

export const Stringer: StringerT<User> = {
	serialize: JSON.stringify,
	parse: (value) => {
		const data = JSON.parse(value);
		if (isAnonymousUser(data) || isRegularUser(data)) {
			return option.some(data);
		}
		return option.none;
	},
};

export type RegularUser = {
	type: "regularUser";
	id: string;
	name: string;
	password: string;
	profile: Profile;
	createdAt: number;
	updatedAt: number;
};

export type AnonymousUser = {
	type: "anonymous";
	id: string;
	profile: Profile;
	createdAt: number;
	updatedAt: number;
};

export const regularUser: Constructor<RegularUser, "type", "profile"> = ({
	id,
	name,
	password,
	profile,
	createdAt,
	updatedAt,
}) => ({
	type: "regularUser",
	id,
	name,
	password: hash(password),
	profile: {
		color: profile?.color ?? colorM.defaultColor,
		nickname: profile?.nickname ?? `User ${nanoid(4)}`,
	},
	createdAt,
	updatedAt,
});

export const anonymousUser: Constructor<AnonymousUser, "type", "profile"> = ({
	id,
	profile,
	createdAt,
	updatedAt,
}) => ({
	type: "anonymous",
	id,
	profile: {
		color: profile?.color ?? colorM.defaultColor,
		nickname: profile?.nickname ?? `Anon ${nanoid(4)}`,
	},
	createdAt,
	updatedAt,
});

export const updateProfile = (profile: Profile, timestamp: number) => {
	return (user: User): User => {
		return pipe(
			user,
			lens.set("profile", profile),
			lens.set("updatedAt", timestamp),
		);
	};
};

export const isRegularUser = (value: unknown): value is RegularUser => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return value?.type === "regularUser";
};

export const isAnonymousUser = (value: unknown): value is AnonymousUser => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return value?.type === "anonymous";
};

const hash = (a: string) =>
	crypto.createHash("sha256").update(a).digest().toString();

export const userM = {
	Eq,
	Stringer,
	regularUser,
	anonymousUser,
	updateProfile,
	isRegularUser,
	isAnonymousUser,
	updatePassword: (password: string) => {
		return (user: User): User => {
			if (!isRegularUser(user)) {
				return user;
			}
			return pipe(user, lens.set("password", hash(password)));
		};
	},
};
