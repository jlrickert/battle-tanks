import { eq, string } from "fp-ts";

export type Color = {
	primary: string;
	secondary: string;
	tertiary: string;
};

export const make = (color: Color): Color => ({
	primary: color.primary,
	secondary: color.secondary,
	tertiary: color.tertiary,
});

export const defaultColor = make({
	primary: "#ff0000",
	secondary: "#0000ff",
	tertiary: "#00ff00",
});

export const Eq: eq.Eq<Color> = eq.struct<Color>({
	primary: string.Eq,
	secondary: string.Eq,
	tertiary: string.Eq,
});

export const colorM = {
	make,
	defaultColor,
	Eq,
};
