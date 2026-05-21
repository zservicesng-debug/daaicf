import Link from "next/link";
import { sendChatMessageAction } from "@/app/_actions/admin";
import { Card } from "@/components/ui/card";
import { TextArea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAuthorizedPortalPageSession } from "@/lib/auth/portal";
import { getMessagesForRoom, getStore, listChatRoomsForUser } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default async function PartnerChatPage(props: PageProps<"/partner/chat">) {
  const session = await requireAuthorizedPortalPageSession("partner");
  const rooms = await listChatRoomsForUser(session.userId);
  const searchParams = await props.searchParams;
  const roomId = (searchParams.room as string) || rooms[0]?.id;
  const selectedRoom = rooms.find((room) => room.id === roomId) || rooms[0];
  const messages = selectedRoom
    ? await getMessagesForRoom(selectedRoom.id, session.userId)
    : [];
  const { users } = await getStore();

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <Card className="p-5">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Rooms</h1>
        <div className="mt-4 space-y-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/partner/chat?room=${room.id}`}
              className="block rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-4 font-medium text-[var(--color-text)]"
            >
              {room.name}
            </Link>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">
          {selectedRoom?.name || "Chat"}
        </h1>
        <div className="mt-5 space-y-4">
          {messages.map((message) => {
            const sender = users.find((user) => user.id === message.senderId);
            return (
              <div key={message.id} className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-[var(--color-text)]">
                    {sender?.orgName || sender?.displayName}
                  </p>
                  <p className="text-xs muted-copy">{formatDate(message.createdAt)}</p>
                </div>
                <p className="mt-3 leading-7 muted-copy">{message.message}</p>
              </div>
            );
          })}
        </div>
        {selectedRoom ? (
          <form action={sendChatMessageAction} className="mt-6 space-y-4">
            <input type="hidden" name="roomId" value={selectedRoom.id} />
            <TextArea name="message" placeholder="Reply to this room..." required />
            <SubmitButton>Send Message</SubmitButton>
          </form>
        ) : null}
      </Card>
    </div>
  );
}

