export type Color = ReturnType<typeof createColor>;

export type RegularUser = {
	type: "regularUser";
	id: string;
	name: string;
	password: string;
	color: Color;
};

export type AnonymousUser = {
	type: "anonymous";
	id: string;
	name: string;
	color: Color;
};
export type User = RegularUser | AnonymousUser;

export const createColor = (args: {
	primary: string;
	secondary: string;
	tertiary: string;
}) => {
	return {
		primary: args.primary,
		secondary: args.secondary,
		tertiary: args.tertiary,
	};
};

export const defaultColor: Color = createColor({
	primary: "#ff0000",
	secondary: "#0000ff",
	tertiary: "#00ff00",
});

export const createAnonymousUser = (args: {
	name: string;
	id: string;
	color?: Color;
}): AnonymousUser => {
	return {
		type: "anonymous",
		id: args.id,
		name: args.name,
		color: args.color ?? defaultColor,
	};
};

export const createRegularUser = (args: {
	id: string;
	name: string;
	password: string;
	color?: Color;
}): RegularUser => {
	return {
		type: "regularUser",
		id: args.id,
		name: args.name,
		password: args.password,
		color: args.color ?? defaultColor,
	};
};

export const isRegularUser = (value: unknown): value is RegularUser => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return value?.type === "regularUser";
};
export const isAnonymousUser = (value: unknown): value is RegularUser => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return value?.type === "anonymous";
};

export const parseUser = <
	T extends {
		type: string;
	},
>(
	value: T,
): User | null => {
	if (isRegularUser(value)) {
		return value;
	}
	if (value.type === "user" || value.type === "anonymous") {
		return value as never;
	}
	return null;
};

export type Session = {
	sessionId: string;
	expires?: string; // ISO-8601 datetime
	userId: string;
};

export const createSession = (args: Session): Session => {
	return {
		sessionId: args.sessionId,
		expires: args.expires,
		userId: args.userId,
	};
};
