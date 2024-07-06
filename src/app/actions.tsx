"use server";

import { AccessToken } from "livekit-server-sdk";
import { type LiveKitConfig } from "@/types";

export async function createStreamerToken(slug: string, config: LiveKitConfig) {
  const token = new AccessToken(
      config.apiKey,
      config.apiSecret,
    {
      // HACK: should really be the streamer's name
      identity: slug,
    }
  );

  token.addGrant({
    room: slug,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
  });

  return await Promise.resolve(token.toJwt());
}

export async function createViewerToken(roomName: string, identity: string, config: LiveKitConfig) {
  const token = new AccessToken(
      config.apiKey,
      config.apiSecret,
    {
      identity: identity,
    }
  );

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: false,
    canPublishData: true,
  });

  return await Promise.resolve(token.toJwt());
}