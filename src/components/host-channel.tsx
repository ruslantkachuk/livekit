"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createStreamerToken } from "@/app/actions";
import { LiveKitRoom } from "@livekit/components-react";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Chat from "./host-chat";
import HostControls from "./host-controls";
import { type LiveKitConfig } from "@/types";

export default function HostChannel({ slug }: { slug: string }) {
  const [streamerToken, setStreamerToken] = useState("");
  const searchParams = useSearchParams();
  const livekitConfig: LiveKitConfig = {
    apiKey: searchParams.get("apiKey") || process.env.LIVEKIT_API_KEY || "",
    apiSecret: searchParams.get("apiSecret") || process.env.LIVEKIT_API_SECRET || "",
    wsUrl: searchParams.get("wsUrl") || process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || "",
  };

  // NOTE: This is a hack to persist the streamer token in the session storage
  // so that the client doesn't have to create a streamer token every time they
  // navigate back to the page.
  useEffect(() => {
    const getOrCreateStreamerToken = async () => {
      const SESSION_STREAMER_TOKEN_KEY = `${slug}-streamer-token`;
      const sessionToken = sessionStorage.getItem(SESSION_STREAMER_TOKEN_KEY);

      if (sessionToken) {
        const payload = jwtDecode(sessionToken);

        if (payload.exp) {
          const expiry = new Date(payload.exp * 1000);
          if (expiry < new Date()) {
            sessionStorage.removeItem(SESSION_STREAMER_TOKEN_KEY);
            const token = await createStreamerToken(slug, livekitConfig);
            setStreamerToken(token);
            sessionStorage.setItem(SESSION_STREAMER_TOKEN_KEY, token);
            return;
          }
        }

        setStreamerToken(sessionToken);
      } else {
        const token = await createStreamerToken(slug, livekitConfig);
        setStreamerToken(token);
        sessionStorage.setItem(SESSION_STREAMER_TOKEN_KEY, token);
      }
    };
    void getOrCreateStreamerToken();
  }, [slug]);

  return (
      <Suspense>
        <LiveKitRoom
            token={streamerToken}
            serverUrl={livekitConfig.wsUrl}
            className="flex flex-1 flex-col"
        >
          <div className="flex h-full flex-1">
            <div className="flex-1 flex-col p-8">
              <HostControls slug={slug} />
            </div>
            <div className="sticky hidden w-80 border-l md:block">
              <div className="absolute top-0 bottom-0 right-0 flex h-full w-full flex-col gap-2 p-2">
                <Chat participantName={slug} />
              </div>
            </div>
          </div>
        </LiveKitRoom>
      </Suspense>
  );
}
