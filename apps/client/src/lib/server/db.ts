/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "mongodb";
import { getGlobalConfig } from "./config";
import { getGlobalLogger, type Logger } from "./logger";

const GlobalThisDB = Symbol.for("sveltekit.mongo");
export const DB_SCOPE = "mongo";

export type Client = ReturnType<typeof createMongoClient>;

const createMongoClient = () => {
	const config = getGlobalConfig();
	const client = new MongoClient(config.mongoURI);
	return client;
};

export class Database {
	private log: Logger;
	constructor(private client: Client) {
		this.log = getGlobalLogger().child({ scope: DB_SCOPE });
	}
	reset() {
		this.log.trace("calling reset");
	}
}

export const getGlobalMongoClient = () => {
	const db = (globalThis as any)[GlobalThisDB];
	if (db) {
		return db;
	}
	const client = createMongoClient();
	(globalThis as any)[GlobalThisDB] = new Database(client);
	return (globalThis as any)[GlobalThisDB];
};
