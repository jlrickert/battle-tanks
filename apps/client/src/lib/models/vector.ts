import { eq, number } from "fp-ts";

export type Vector = {
	x: number;
	y: number;
};

export const make = (x: number, y: number): Vector => ({ x, y });

export const add = (a: Vector) => {
	return (b: Vector): Vector => make(a.x + b.x, a.y + b.y);
};

export const Eq: eq.Eq<Vector> = eq.struct<Vector>({
	x: number.Eq,
	y: number.Eq,
});

export const vectorM = { make, add, Eq };
