import { readable, writable } from "svelte/store";
import { getContext, hasContext, setContext } from "svelte";
import type { Color, User } from "$lib/sessions";
import { createAnonymousUser, defaultColor } from "$lib/sessions";
import { browser } from "$app/environment";
import { nanoid } from "nanoid";
// import type { Session } from "$lib/sessions";

// export const loginSession = writable<Session>(null);

// export const colors = writable<{
// 	primary: string;
// 	secondary: string;
// 	tertiary: string;
// }>({
// 	primary: "#ff0000",
// 	secondary: "#00ff00",
// 	tertiary: "#0000ff",
// });

// export const createStore = <A>(name: string, f: () => A) => {
// 	const context = writable(f());
// 	return [() => getContext<A>(name), () => setContext(name)];
// };

export const sharedStore = <T, A>(
	name: string,
	f: (value?: A) => T,
	defaultValue?: A,
) => {
	if (hasContext(name)) {
		return getContext<T>(name);
	}
	const v = f(defaultValue);
	setContext(name, v);
	return v;
};

export const writableStore = <T>(name: string, value: T) => {
	return sharedStore(name, writable, value);
};

export const readableStore = <T>(name: string, value: T) => {
	return sharedStore(name, readable, value);
};

export const colorsStore = () => writableStore<Color>("colors", defaultColor);

const getUserData = () => {
	const data = window.localStorage.getItem("user");
	if (!data) {
		return null;
	}
	return JSON.parse(data);
};

export const loginSession = writable<User>(
	browser
		? getUserData()
		: createAnonymousUser({ name: `Anon-${nanoid(4)}`, id: nanoid() }),
);
