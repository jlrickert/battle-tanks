/* eslint-disable @typescript-eslint/no-explicit-any */
import { createGlobalGroup } from "$lib/server/globalGroup";
import { createRepo } from "$lib/server/storage/repo";
import type { User } from "$lib/models/user";
import type { Session } from "$lib/models/session";
import type { Option } from "fp-ts/Option";
import type { DeleteResult, InsertOneResult, WithId } from "mongodb";
import { pipe } from "fp-ts/function";
import { option } from "fp-ts";

export type Storage = {
	createSession: (session: Session) => Promise<InsertOneResult<Session>>;
	createUser: (user: User) => Promise<InsertOneResult<User>>;
	lookupSession: (sessionId: string) => Promise<Option<Session>>;
	lookupUser: (userId: string) => Promise<Option<User>>;
	deleteSession: (sessionId: string) => Promise<DeleteResult>;

	// getUserOrCreate: (sessionId: string) => Promise<User>;
	// joinChatRoom: (userId: string) => Promise<UpdateResult<ChatRoom>>;
	// leaveChatRoom: (userId: string) => Promise<UpdateResult<ChatRoom>>;
};

export const createStorage = async (): Promise<Storage> => {
	const userRepo = await createRepo<User>("users");
	const sessionRepo = await createRepo<Session>("sessions");
	// const chatRooms = await createRepo<ChatRoom>("chatRooms");

	// const getUserOrCreate: Storage["getUserOrCreate"] = async (sessionId) => {
	// 	const session = await sessionRepo.lookup({ id: sessionId });
	// 	if (option.isNone(session)) {
	// 		const now = Date.now();
	// 		const user = userM.anonymousUser({
	// 			id: nanoid(),
	// 			createdAt: now,
	// 			updatedAt: now,
	// 			nickname: `Anon ${nanoid(4)}`,
	// 		});
	// 		const session = sessionM.make({
	// 			id: nanoid(),
	// 			userId: user.id,
	// 			expiresAt: 0,
	// 		});
	// 		await sessionRepo.insertOne(session);
	// 		await userRepo.insertOne(user);
	// 		return user;
	// 	}
	//
	// 	const user = await userRepo.lookup({ id: session.value.userId });
	// 	if (!user) {
	// 	}
	// 	const user = pipe(
	// 		session,
	// 		option.map(async (session) => userRepo.lookup(session.userId)),
	// 	);
	// 	const user = pipe(
	// 		option.chain(async (session) => {
	// 			return await userRepo.lookup({ id: session.userId });
	// 		}),
	// 		(a) => a,
	// 	);
	// };

	const stripMongoId = <A>(item: WithId<A>): A => {
		const n: any = { ...item };
		delete n["_id"];
		return n;
	};
	return {
		// getUserOrCreate,
		createSession: (session) => {
			return sessionRepo.insertOne(session);
		},
		createUser: (user) => {
			return userRepo.insertOne(user);
		},
		lookupUser: async (userId) => {
			const user = await userRepo.lookup({ id: userId });
			return option.map(stripMongoId)(user);
		},
		lookupSession: async (sessionId) => {
			const session = await sessionRepo.lookup({ id: sessionId });
			return option.map(stripMongoId)(session);
		},
		deleteSession: (sessionId) => {
			return sessionRepo.deleteOne({ id: sessionId });
		},
	};
};

// export const getUserBySession =
// 	(sessionId: string) =>
// 	(
// 		storage: Storage,
// 	): taskOption.TaskOption<{
// 		user: userM.User;
// 		session: sessionM.Session;
// 	}> => {
// 		return pipe(
// 			taskOption.Do,
// 			taskOption.bind("session", () => {
// 				return storage.session.getSession(sessionId);
// 			}),
// 			taskOption.bind("user", ({ session }) => {
// 				return storage.user.getUser(session.userId);
// 			}),
// 		);
// 	};
//
export const getGlobalStorage = createGlobalGroup("storage", createStorage);

// export const storageM = {
// 	getOrCreateUser: (sessionID: string) => {
// 		return (storage: Storage) => {};
// 	},
// 	joinChatRoom: (args: { roomId: string; user: User | string }) => {
// 		const { roomId, user } = args;
// 		const userId = typeof user === "string" ? user : user.id;
// 		return (storage: Storage) => {
// 			return storage.chatRooms.updateOne(
// 				{ id: roomId },
// 				{ $addToSet: { userList: userId } },
// 			);
// 		};
// 	},
// 	leaveChatRoom: (args: { roomId: string; user: User | string }) => {
// 		const { roomId, user } = args;
// 		const userId = typeof user === "string" ? user : user.id;
// 		return (storage: Storage) => {
// 			return storage.chatRooms.updateOne(
// 				{ id: roomId },
// 				{ $pull: { userList: userId } },
// 			);
// 		};
// 	},
// };
