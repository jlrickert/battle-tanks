import { option } from "fp-ts";
import { pipe } from "fp-ts/function";
import { getMongoClient } from "$lib/server/storage/mongo";
import type { Document, Filter, Collection, WithId } from "mongodb";
import type { Option } from "fp-ts/Option";

export type Repo<A extends Document> = Omit<Collection<A>, "findOne"> & {
	lookup: (filter: Filter<A>) => Promise<Option<WithId<A>>>;
};

export const createRepo = async <A extends Document>(
	collection: string,
): Promise<Repo<A>> => {
	const mongo = getMongoClient().collection<A>(collection);

	await mongo.createIndex({ id: 1 });
	(mongo as unknown as Repo<A>).lookup = async (filter) => {
		return pipe(await mongo.findOne(filter), option.fromNullable);
	};
	return mongo as unknown as Repo<A>;
};
