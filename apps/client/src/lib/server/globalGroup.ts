/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Prevent things from reloading
 *
 * Inspired by groups in neovim (don't remember the name)
 */
export const createGlobalGroup = <A>(name: string, init: () => A) => {
	const key = Symbol.for(name);
	return (): A => {
		let item = (globalThis as any)[key];
		if (item === undefined) {
			item = init();
			(globalThis as any)[key] = item;
		}
		return item;
	};
};
export const initGlobalGroup = <A>(name: string, init: () => A) => {
	const key = Symbol.for(name);
	let item = (globalThis as any)[key];
	if (item === undefined) {
		item = init();
		(globalThis as any)[key] = item;
	}
};
