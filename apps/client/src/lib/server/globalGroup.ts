/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Prevent things from reloading
 *
 * Inspired by groups in neovim (don't remember the name)
 */
export const createGlobalGroup = <A>(
	name: string,
	init: () => A,
): (() => A) => {
	const key = Symbol.for(name);
	return () => {
		let item = (globalThis as any)[key];
		if (item === undefined) {
			item = init();
			(globalThis as any)[key] = item;
		}
		return item;
	};
};
