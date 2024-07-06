import { Button } from "@/components/ui/button";
import { useLocalParticipant } from "@livekit/components-react";
import { Track, createLocalTracks, type LocalTrack, createLocalScreenTracks } from "livekit-client";
import { useRef, useState } from "react";

interface Props {
  slug: string;
}

export default function HostControls({ slug }: Props) {
  const [videoTrack, setVideoTrack] = useState<LocalTrack>();
  const [audioTrack, setAudioTrack] = useState<LocalTrack>();
  const [screenShareTrack, setScreenShareTrack] = useState<LocalTrack>();
  const [screenShareAudioTrack, setScreenShareAudioTrack] = useState<LocalTrack>();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const cameraVideoEl = useRef<HTMLVideoElement>(null);
  const screenVideoEl = useRef<HTMLVideoElement>(null);

  const { localParticipant } = useLocalParticipant();

  const createCameraTracks = async () => {
    const tracks = await createLocalTracks({
      audio: true,
      video: {
        facingMode: 'user',
        resolution: {
          width: 480,
          height: 320,
          frameRate: 20,
        },
      }
    });

    tracks.forEach((track) => {
      switch (track.kind) {
        case Track.Kind.Video: {
          if (cameraVideoEl?.current) {
            track.attach(cameraVideoEl.current);
          }
          setVideoTrack(track);
          break;
        }
        case Track.Kind.Audio: {
          setAudioTrack(track);
          break;
        }
      }
    });
  };
  const createScreenShareTracks = async () => {
    const screenTracks = await createLocalScreenTracks({
      audio: true,
      resolution: {
        width: 1024,
        height: 576,
        frameRate: 24,
      },
    });

    screenTracks.forEach((track) => {
      switch (track.kind) {
        case Track.Kind.Video: {
          if (screenVideoEl?.current) {
            track.attach(screenVideoEl.current);
          }
          setScreenShareTrack(track);
          break;
        }
        case Track.Kind.Audio: {
          setScreenShareAudioTrack(track);
          break;
        }
      }
    });
  };

  const startStream = () => {
    if (!localParticipant) {
      return;
    }

    if (videoTrack) {
      void localParticipant.publishTrack(videoTrack);
    }
    if (audioTrack) {
      void localParticipant.publishTrack(audioTrack);
    }
    if (screenShareTrack) {
      void localParticipant.publishTrack(screenShareTrack);
    }
    if (screenShareAudioTrack) {
      void localParticipant.publishTrack(screenShareAudioTrack);
    }

    setIsPublishing((prev) => !prev);
  };
  const stopStream = () => {
    if (isPublishing && localParticipant) {
      setIsUnpublishing(true);

      if (videoTrack) {
        void localParticipant.unpublishTrack(videoTrack);
      }
      if (audioTrack) {
        void localParticipant.unpublishTrack(audioTrack);
      }
      if (screenShareTrack) {
        void localParticipant.unpublishTrack(screenShareTrack);
      }
      if (screenShareAudioTrack) {
        void localParticipant.unpublishTrack(screenShareAudioTrack);
      }

      setVideoTrack(undefined);
      setAudioTrack(undefined);
      setScreenShareTrack(undefined);
      setScreenShareAudioTrack(undefined);

      setTimeout(() => {
        setIsUnpublishing(false);
        setIsPublishing(false);
      }, 2000);
    }
  };

  return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-[5px] text-lg font-bold">
            {isPublishing && !isUnpublishing ? (
                <div className="flex items-center gap-1">
                  <span className="relative mr-1 flex h-3 w-3">
                    <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                  </span>
                  LIVE
                </div>
            ) : (
                "Ready to stream"
            )}{" "}
            as{" "}
            <div className="italic text-purple-500 dark:text-purple-300">
              {slug}
            </div>
          </div>
          <div className="flex gap-2">
            {isPublishing ? (
                <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => void stopStream()}
                    disabled={isUnpublishing}
                >
                  {isUnpublishing ? "Stopping..." : "Stop stream"}
                </Button>
            ) : (
                <Button
                    size="sm"
                    onClick={() => void startStream()}
                    className="animate-pulse"
                >
                  Start stream
                </Button>
            )}
          </div>
        </div>
        <div className="rounded-sm border bg-neutral-800" style={{position: 'relative'}}>
          <video ref={screenVideoEl} width="100%"/>
          <video ref={cameraVideoEl} width="25%"
                 style={{position: 'absolute', left: '0', bottom: '0', zIndex: 2}}/>
        </div>
        <div className="flex gap-2">
            <Button
                size="sm"
                onClick={ () => void createCameraTracks() }
                disabled={isPublishing || !!(videoTrack && audioTrack)}
            >
                Start camera
            </Button>
            <Button
                size="sm"
                onClick={ () => void createScreenShareTracks() }
                disabled={isPublishing || !!screenShareTrack}
            >
              Start screen share
            </Button>
        </div>
      </div>
  );
}
