import type { Session } from "$lib/models/session";
import { createRepo } from "$lib/server/storage/repo";
import type { Option } from "fp-ts/Option";
import type { DeleteResult, InsertOneResult } from "mongodb";

export type SessionRepo = {
	create: (session: Session) => Promise<InsertOneResult<Session>>;
	getSession: (sessionId: string) => Promise<Option<Session>>;
	delete: (sessionId: string) => Promise<DeleteResult>;
};

export const createSessionRepo = (): SessionRepo => {
	const repo = createRepo<Session>("sessions");
	return {
		create: async (session) => {
			const r = await repo;
			return r.insert(session);
		},
		getSession: async (sessionId) => {
			const r = await repo;
			return r.findOne({ id: sessionId });
		},
		delete: async (sessionId) => {
			const r = await repo;
			return r.delete({ id: sessionId });
		},
	};
};
