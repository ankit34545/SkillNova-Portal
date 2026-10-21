import { NextRequest, NextResponse } from "next/server";
import { ClassroomRepository } from "@/lib/repository";

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const meeting = await ClassroomRepository.getMeeting(params.roomId);
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  }
  // Don't expose internal host IDs, only safe metadata
  const { hostId: _h, ...safeMeeting } = meeting;
  void _h;
  return NextResponse.json({ meeting: safeMeeting });
}
