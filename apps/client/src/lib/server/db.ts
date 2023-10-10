/* eslint-disable @typescript-eslint/no-explicit-any */
import { Filter, MongoClient, UpdateFilter } from "mongodb";
import { getGlobalConfig } from "./config";

const GlobalThisDB = Symbol.for("sveltekit.mongo");
export const DB_SCOPE = "mongo";

export type Client = ReturnType<typeof createMongoClient>;

const createMongoClient = () => {
	const config = getGlobalConfig();
	return new MongoClient(config.mongoURI);
};

export type Database = {
	migrate(): Promise<void>;
	insert<T>(collectionName: string, data: T): Promise<boolean>;
	update<T>(
		collectionName: string,
		filter: Filter<T>,
		update: UpdateFilter<T> | Partial<T>,
	): Promise<void>;
	findOne<T>(collectionName: string, filter: Filter<T>): Promise<T | null>;
};

const createDatabase = (client: MongoClient): Database => {
	const db = client.db("battle-tanks");

	return {
		migrate: async (): Promise<void> => {
			await db.createCollection("collection");
		},
		insert: async (name, value) => {
			const col = db.collection(name);
			if (Array.isArray(value)) {
				const result = await col.insertMany(value);
				result.insertedIds;
				return result.acknowledged;
			} else {
				const result = await col.insertOne(value);
				return result.acknowledged;
			}
		},
		update: async function (collectionName: string, filter, update) {
			return (await db
				.collection(collectionName)
				.updateOne(filter as any, update)) as any;
		},
		findOne: async function (collectionName: string, filter) {
			const result = await db
				.collection(collectionName)
				.findOne(filter as any);
			if (!result) {
				return null;
			}
			return result as any;
		},
	};
};

export const getGlobalMongoClient = (): Database => {
	const db = (globalThis as any)[GlobalThisDB];
	if (db) {
		return db;
	}
	const client = createMongoClient();
	(globalThis as any)[GlobalThisDB] = createDatabase(client);
	return (globalThis as any)[GlobalThisDB];
};
