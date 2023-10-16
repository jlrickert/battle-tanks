import type { User } from "$lib/models/user";
import { createRepo } from "$lib/server/storage/repo";
import type { Option } from "fp-ts/Option";
import type {
	DeleteResult,
	Filter,
	InsertOneResult,
	UpdateFilter,
	UpdateResult,
} from "mongodb";

export type UserRepo = {
	addUser: (user: User) => Promise<InsertOneResult<User>>;
	getUser: (userId: string) => Promise<Option<User>>;
	find: (filter: Filter<User>) => Promise<readonly User[]>;
	update: (
		userId: string,
		updater: UpdateFilter<User> | Partial<User>,
	) => Promise<UpdateResult<User>>;
	delete: (userId: string) => Promise<DeleteResult>;
};

// export const createUserRepo = (): UserRepo => {
// 	const repo = createRepo<User>("users");
// 	return {
// 		addUser: async (user) => {
// 			const r = await repo;
// 			return r.insert(user);
// 		},
// 		getUser: async (userId) => {
// 			const r = await repo;
// 			return r.findOne({ id: userId });
// 		},
// 		find: async (filter) => {
// 			const r = await repo;
// 			return r.find(filter);
// 		},
// 		update: async (userId, updater) => {
// 			const r = await repo;
// 			return r.updateOne({ id: userId }, updater);
// 		},
// 		delete: async (userId) => {
// 			const r = await repo;
// 			return r.delete({ id: userId });
// 		},
// 	};
// };
