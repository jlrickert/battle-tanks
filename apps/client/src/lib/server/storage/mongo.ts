import { Document, MongoClient, UpdateResult } from "mongodb";

import { getGlobalConfig } from "$lib/server/config";
import { createGlobalGroup } from "$lib/server/globalGroup";

const createMongoClient = () => {
	const config = getGlobalConfig();
	const client = new MongoClient(config.mongoURI);
	return client.db("battle-tanks");
};

export const getMongoClient = createGlobalGroup("mongo", createMongoClient);

const concat2UpdateResult = <A extends Document>(
	a: UpdateResult<A>,
	b: UpdateResult<A>,
): UpdateResult<A> => {
	if (a.acknowledged && b.acknowledged) {
		return {
			acknowledged: true,
			upsertedId: b.upsertedId,
			upsertedCount: a.upsertedCount + b.upsertedCount,
			matchedCount: a.matchedCount + b.matchedCount,
			modifiedCount: a.modifiedCount + b.modifiedCount,
		};
	}
	if (a.acknowledged) {
		return a;
	}
	return b;
};

export const concatUpdateResult = <A extends Document>(
	...results: UpdateResult<A>[]
): UpdateResult<A> => {
	return results.reduce(concat2UpdateResult, {
		acknowledged: false,
		modifiedCount: 0,
		matchedCount: 0,
		upsertedCount: 0,
		upsertedId: null,
	} satisfies UpdateResult<A>);
};
