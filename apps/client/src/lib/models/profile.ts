import { eq, string } from "fp-ts";
import { type Color, colorM } from "$lib/models/color";
import type { Constructor } from "$lib/funcUtils";

export type Profile = {
	nickname: string;
	color: Color;
};

export const Eq: eq.Eq<Profile> = eq.struct<Profile>({
	nickname: string.Eq,
	color: colorM.Eq,
});

export const make: Constructor<Profile, never, "color"> = ({
	color = colorM.defaultColor,
	nickname,
}) => ({
	nickname,
	color,
});

export const profileM = {
	Eq,
	make,
};
