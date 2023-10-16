import type { Option } from "fp-ts/Option";
import type { GameState } from "$lib/models/gameState";
import type { UpdateResult } from "mongodb";

export type GameStateRepo = {
	loadState: (id: string) => Promise<Option<GameState>>;
	saveState: (state: GameState) => Promise<UpdateResult<GameState>>;
};
