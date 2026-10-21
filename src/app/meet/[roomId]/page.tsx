import React from "react";
import MeetingRoomClient from "@/components/meet/MeetingRoomClient";

export default function MeetingRoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  return <MeetingRoomClient roomId={params.roomId} />;
}
