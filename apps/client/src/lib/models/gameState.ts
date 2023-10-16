import { array, eq, option, record, string } from "fp-ts";
import { pipe } from "fp-ts/function";
import type { stringerM } from "$lib";
import type { Tank } from "$lib/models/tank";
import { tankM } from "$lib/models/tank";
import type { Constructor } from "$lib/funcUtils";
import { lens } from "$lib/funcUtils";
import type { Profile } from "$lib/models/profile";

export type GameState = {
	id: string;
	userTanks: Record<string, string>;
	tanks: Record<string, Tank>;
};

export const Eq: eq.Eq<GameState> = eq.struct<GameState>({
	id: string.Eq,
	userTanks: record.getEq(string.Eq),
	tanks: record.getEq(tankM.Eq),
});

export const Stringer: stringerM.StringerT<GameState> = {
	serialize: (state) => {
		return JSON.stringify(state);
	},
	parse: (state) => {
		return pipe(state, JSON.parse, option.some);
	},
};

export const make: Constructor<GameState, never, never> = (
	state: GameState,
): GameState => ({
	id: state.id,
	userTanks: state.userTanks,
	tanks: state.tanks,
});

export const addTank = (owner: string, tank: Tank) => {
	return (state: GameState): GameState => {
		const tanks = pipe(state.tanks, record.upsertAt(tank.id, tank));
		const userTanks = pipe(
			state.userTanks,
			record.upsertAt(owner, tank.id),
		);
		return make({ ...state, userTanks, tanks });
	};
};

export const getTank = (tankId: string) => {
	return (state: GameState): option.Option<Tank> => {
		return pipe(state.tanks, record.lookup(tankId));
	};
};

export const removeTank = (tankId: string) => {
	return (state: GameState): GameState => {
		const tank = pipe(state, getTank(tankId));
		if (option.isNone(tank)) {
			return state;
		}
		const tanks = pipe(state.tanks, record.deleteAt(tankId));
		const userTanks = pipe(
			state.userTanks,
			record.deleteAt(tank.value.userId),
		);
		return make({ ...state, userTanks, tanks });
	};
};

export const removeUser = (userId: string) => {
	return (state: GameState): GameState => {
		return pipe(
			state,
			lens.modify("userTanks", record.deleteAt(userId)),
			lens.modify(
				"tanks",
				array.filter((tank: Tank) => tank.userId !== userId),
			),
		);
	};
};

export const getUserTank = (userId: string) => {
	return (state: GameState): option.Option<Tank> => {
		return pipe(
			record.lookup(userId)(state.userTanks),
			option.chain((tankId) => record.lookup(tankId)(state.tanks)),
		);
	};
};

export const updateProfile = (userId: string, profile: Profile) => {
	return (state: GameState): GameState => {
		return pipe(
			record.lookup(userId)(state.userTanks),
			option.chain((tankId) => record.lookup(tankId)(state.tanks)),
			option.chain((originalTank) => {
				const tank = tankM.updateProfile(profile)(originalTank);
				if (tank === originalTank) {
					return option.none;
				}
				return option.some(tank);
			}),
			option.map((tank) => record.upsertAt(tank.id, tank)(state.tanks)),
			option.map((tanks) => make({ ...state, tanks })),
			option.getOrElse(() => state),
		);
	};
};

export const gameStateM = {
	make,
	getTank,
	getUserTank,
	removeUser,
	removeTank,
	addTank,
	Eq,
	Stringer,
};
