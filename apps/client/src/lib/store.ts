import { readable, writable } from "svelte/store";
import { getContext, hasContext, setContext } from "svelte";
import { browser } from "$app/environment";
import { nanoid } from "nanoid";
import type { Color } from "$lib/models/color";
import { colorM } from "$lib/models/color";
import type { User } from "$lib/models/user";
import { userM } from "$lib/models/user";
import type { GameState } from "$lib/models/gameState";
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

export const colorsStore = () =>
	writableStore<Color>("colors", colorM.defaultColor);

export const loginSession = writable<User>(null as any);
export const gameState = writable<GameState | null>(null as any);
