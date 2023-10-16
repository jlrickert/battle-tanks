import type { option } from "fp-ts";
import { pipe } from "fp-ts/function";

export type StringerT<A> = {
	serialize: (item: A) => string;
	parse: (item: string) => option.Option<A>;
};

export const serialize = <A>(stringer: StringerT<A>) => {
	return (item: A): string => {
		return pipe(item, stringer.serialize, JSON.stringify);
	};
};

export const parse = <A>(stringer: StringerT<A>) => {
	return (value: string): option.Option<A> => {
		return pipe(value, stringer.parse);
	};
};

export const stringerM = { serialize, parse };

// export const stringStringer: Stringer<string> = {
// 	toString: (item) => JSON.stringify(item),
// 	parse: (value) => JSON.parse(value),
// };
//
// export const numberStringer: Stringer<number> = {
// 	toString: (item) => JSON.stringify(item),
// 	parse: (value) => JSON.parse(value),
// };
//
// export const booleanStringer: Stringer<boolean> = {
// 	toString: (item) => JSON.stringify(item),
// 	parse: (value) => JSON.parse(value),
// };
//
// export const nullable = <A>(
// 	stringer: Stringer<A>,
// ): Stringer<option.Option<A>> => {
// 	return {
// 		parse: (item) => {
// 			const data = JSON.parse(item);
// 			if (data === null) {
// 				return option.none;
// 			}
// 			return stringer.parse(item);
// 		},
// 		toString: (item) => {
// 			if (option.isNone(item)) {
// 				return JSON.stringify(null);
// 			}
// 			return stringer.parse(item.value);
// 		},
// 	};
// };
//
// export const array = <A>(stringer: Stringer<A>): Stringer<A[]> => {
// 	return {
// 		parse: (item) => {
// 			return pipe(item, JSON.parse, stringer)
// 		},
// 	};
// };
//
// export const struct = <A>(stringers: {
// 	[K in keyof A]: Stringer<A[K]>;
// }): Stringer<{ readonly [K_1 in keyof A]: A[K_1] }> => {
// 	return {
// 		parse: (item) => {
// 			let o: any;
// 			for (const key in stringers) {
// 				const {parse, toString} = stringers[key];
// 				o[key] = parse(item);
// 			}
// 			return o;
// 		},
// 		toString: (item) => {
// 		},
// 	};
// };
