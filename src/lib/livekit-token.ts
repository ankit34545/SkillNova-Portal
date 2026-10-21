// src/lib/livekit-token.ts
// Secure LiveKit token generation utility

import { AccessToken } from "livekit-server-sdk";

export interface GenerateTokenOptions {
  roomName: string;
  participantIdentity: string;
  participantName: string;
  isHost?: boolean;
  canPublish?: boolean;
  canSubscribe?: boolean;
}

export async function generateLiveKitToken({
  roomName,
  participantIdentity,
  participantName,
  isHost = false,
  canPublish = true,
  canSubscribe = true,
}: GenerateTokenOptions): Promise<{ token: string; serverUrl: string }> {
  const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
  const apiSecret = process.env.LIVEKIT_API_SECRET || "secret_for_local_livekit_testing_123456789";
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://demo.livekit.cloud";

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    name: participantName,
    ttl: "4h",
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish,
    canSubscribe,
    canPublishData: true,
    roomAdmin: isHost,
  });

  const jwt = await token.toJwt();
  return { token: jwt, serverUrl };
}
