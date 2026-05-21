import Link from "next/link";
import {
  createChatRoomAction,
  deleteChatRoomAction,
  sendChatMessageAction,
} from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAuthorizedPortalPageSession } from "@/lib/auth/portal";
import {
  getMessagesForRoom,
  getStore,
  listUsersByRole,
  listChatMembersForRoom,
} from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default async function AdminChatPage(props: PageProps<"/admin/chat">) {
  const session = await requireAuthorizedPortalPageSession("admin");
  const searchParams = await props.searchParams;
  const { chatRooms, users } = await getStore();
  const roomId = (searchParams.room as string) || chatRooms[0]?.id;
  const selectedRoom = chatRooms.find((room) => room.id === roomId) || chatRooms[0];
  const messages = selectedRoom
    ? await getMessagesForRoom(selectedRoom.id, session.userId)
    : [];
  const selectedMembers = selectedRoom
    ? await listChatMembersForRoom(selectedRoom.id)
    : [];
  const sponsorUsers = await listUsersByRole("sponsor");
  const partnerUsers = await listUsersByRole("partner");
  const availableUsers = sponsorUsers.concat(partnerUsers);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif-display text-4xl font-bold text-[var(--color-text)]">
          Chat
        </h1>
        <p className="mt-2 muted-copy">Create rooms and manage conversations with sponsors and partners.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Create Room</h2>
            {availableUsers.length > 0 ? (
              <form action={createChatRoomAction} className="mt-4 space-y-4">
                <TextInput name="name" placeholder="Room name" required />
                <SelectInput name="type" defaultValue="sponsor">
                  <option value="sponsor">Sponsor</option>
                  <option value="partner">Partner</option>
                </SelectInput>
                <SelectInput
                  name="linkedUserId"
                  defaultValue={sponsorUsers[0]?.id || partnerUsers[0]?.id}
                >
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.role === "sponsor" ? "Sponsor" : "Partner"} -{" "}
                      {user.orgName || user.displayName}
                    </option>
                  ))}
                </SelectInput>
                <SubmitButton>Create Room</SubmitButton>
              </form>
            ) : (
              <p className="mt-4 text-sm muted-copy">
                Approved sponsor or partner accounts need to exist before a private
                room can be created.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Rooms</h2>
            {chatRooms.length > 0 ? (
              <div className="mt-4 space-y-3">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
                  >
                    <Link
                      href={`/admin/chat?room=${room.id}`}
                      className="font-semibold text-[var(--color-text)]"
                    >
                      {room.name}
                    </Link>
                    <p className="mt-1 text-sm muted-copy">{room.type}</p>
                    <form action={deleteChatRoomAction} className="mt-3">
                      <input type="hidden" name="roomId" value={room.id} />
                      <button
                        type="submit"
                        className="text-sm font-semibold text-[var(--color-accent)]"
                      >
                        Delete room
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm muted-copy">
                No private rooms yet. Create the first sponsor or partner room above.
              </p>
            )}
          </Card>
        </div>

        <Card className="p-5">
          <div className="border-b border-[var(--color-border)] pb-4">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              {selectedRoom?.name || "No room selected"}
            </h2>
            <p className="mt-1 text-sm muted-copy">
              {selectedRoom
                ? `Private ${selectedRoom.type} room`
                : "Create a room to begin."}
            </p>
          </div>
          {selectedRoom ? (
            <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">Room Members</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {selectedMembers.map((member) => {
                  const user = users.find((entry) => entry.id === member.userId);
                  return (
                    <div
                      key={member.id}
                      className="rounded-[var(--radius-card)] bg-white px-4 py-3"
                    >
                      <p className="font-semibold text-[var(--color-text)]">
                        {user?.orgName || user?.displayName || "User"}
                      </p>
                      <p className="mt-1 text-sm capitalize muted-copy">
                        {member.role} - {user?.role || "member"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className="mt-5 space-y-4">
            {messages.map((message) => {
              const sender = users.find((user) => user.id === message.senderId);
              return (
                <div key={message.id} className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-[var(--color-text)]">
                      {sender?.orgName || sender?.displayName || "User"}
                    </p>
                    <p className="text-xs muted-copy">{formatDate(message.createdAt)}</p>
                  </div>
                  <p className="mt-3 leading-7 muted-copy">{message.message}</p>
                </div>
              );
            })}
            {selectedRoom && messages.length === 0 ? (
              <p className="text-sm muted-copy">
                No messages yet. Start the conversation with this member.
              </p>
            ) : null}
          </div>
          {selectedRoom ? (
            <form action={sendChatMessageAction} className="mt-6 space-y-4">
              <input type="hidden" name="roomId" value={selectedRoom.id} />
              <TextArea name="message" placeholder="Write a message..." required />
              <SubmitButton>Send Message</SubmitButton>
            </form>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

