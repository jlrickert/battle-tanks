import { eq, number, option, string } from "fp-ts";
import type { stringerM } from "$lib";
import { type Vector, vectorM } from "$lib/models/vector";
import type { Color } from "$lib/models/color";
import { colorM } from "$lib/models/color";
import { pipe } from "fp-ts/function";
import type { Profile } from "$lib/models/profile";
import { profileM } from "$lib/models/profile";

export type Tank = {
	id: string;
	turretAngle: number;
	position: Vector;
	velocity: Vector;
	acceleration: Vector;
	userId: string;
	nickname: string;
	color: Color;
};

export const Eq: eq.Eq<Tank> = eq.struct<Tank>({
	acceleration: vectorM.Eq,
	id: string.Eq,
	position: vectorM.Eq,
	turretAngle: number.Eq,
	velocity: vectorM.Eq,
	userId: string.Eq,
	color: colorM.Eq,
	nickname: string.Eq,
});

export const Stringer: stringerM.StringerT<Tank> = {
	serialize: JSON.stringify,
	parse: (item) => {
		return pipe(item, JSON.parse, option.some);
	},
};

export const make = (tank: Tank): Tank => ({
	id: tank.id,
	turretAngle: tank.turretAngle,
	velocity: tank.velocity,
	position: tank.velocity,
	acceleration: tank.acceleration,
	userId: tank.userId,
	nickname: tank.nickname,
	color: tank.color,
});

/**
 * returns the same tank if nothing is updated
 * @param profile
 */
export const updateProfile = (profile: Profile) => {
	return (tank: Tank): Tank => {
		if (profileM.Eq.equals(tank, profile)) {
			return tank;
		}
		return make({
			...tank,
			nickname: profile.nickname,
			color: profile.color,
		});
	};
};

export const tankM = { Eq, Stringer, make, updateProfile };
