import { test, describe } from "vitest";
import { createChatRoomRepo } from "$lib/server/db";
import { nanoid } from "nanoid";

describe.concurrent("chat repo", () => {
	test("should have the expected properties", ({ expect }) => {
		const db = createChatRoomRepo();
		const room = db.createRoom({
			name: "Global",
			id: nanoid(),
			messages: [],
			users: [],
		});
		expect(room).equal(
			db.getRoom(room.id),
			"able to retrieve created room",
		);
		db.joinRoom({ userId: "1", roomId: room.id });
		expect(room).equal(
			db.getRoom(room.id),
			"able to retrieve created room",
		);
		expect(db.getRoom(room.id)).equals(
			expect.objectContaining({ users: ["1"] }),
		);
	});
});
