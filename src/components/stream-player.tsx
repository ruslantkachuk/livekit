import {
  StartAudio,
  useConnectionState,
  useRemoteParticipant,
  useTracks,
  type TrackReference
} from "@livekit/components-react";
import { ConnectionState, Track, type Participant } from "livekit-client";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

import { Icons } from "./ui/icons";

function toString(connectionState: string) {
  switch (connectionState) {
    case "connected":
      return "Connected!";
    case "connecting":
      return "Connecting...";
    case "disconnected":
      return "Disconnected";
    case "reconnecting":
      return "Reconnecting";
    default:
      return "Unknown";
  }
}

interface StreamPlayerWrapperProps {
  streamerIdentity: string;
}

export default function StreamPlayerWrapper({ streamerIdentity }: StreamPlayerWrapperProps) {
  const connectionState = useConnectionState();
  const participant = useRemoteParticipant(streamerIdentity);
  const tracks = useTracks(Object.values(Track.Source)).filter(
    (track) => track.participant.identity === streamerIdentity
  );

  if (connectionState !== ConnectionState.Connected || !participant) {
    return (
      <div className="grid aspect-video items-center justify-center bg-black text-sm uppercase text-white">
        {connectionState === ConnectionState.Connected
          ? "Stream is offline"
          : toString(connectionState)}
      </div>
    );
  } else if (tracks.length === 0) {
    return (
      <>
        <div className="flex aspect-video items-center justify-center bg-black text-sm uppercase text-white">
          <div className="flex gap-2">
            <div className="h-4 w-4 rounded-full bg-neutral-400 animate-bounce delay-100" />
            <div className="h-4 w-4 rounded-full bg-neutral-500 animate-bounce delay-200" />
            <div className="h-4 w-4 rounded-full bg-neutral-600 animate-bounce delay-300" />
          </div>
        </div>
      </>
    );
  }

  return <StreamPlayer participant={participant} tracks={tracks} />;
}

interface StreamPlayerProps {
    participant: Participant;
    tracks: TrackReference[];
}

export const StreamPlayer = ({ tracks }: StreamPlayerProps) => {
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isScreenShare, setIsScreenShare] = useState(false);
  const [isCameraEnable, setIsCameraEnable] = useState(false);
  const cameraEl = useRef<HTMLVideoElement>(null);
  const videoEl = useRef<HTMLVideoElement>(null);
  const playerEl = useRef<HTMLDivElement>(null);

  const initStream = () => {
    console.log('initStream');

    /**
     * Check if the stream has screen share track
     */
    let isScreenShareEnable = false;

    tracks
        .map((track) => {
          if (track.source === Track.Source.ScreenShare) {
            setIsScreenShare(true);
            isScreenShareEnable = true;
          }

          if (track.source === Track.Source.Camera) {
            setIsCameraEnable(true);
          }

          return track;
        })
        .forEach((track) => {
          if (isScreenShareEnable && [Track.Source.Camera, Track.Source.Microphone].includes(track.source)) {
            if (cameraEl.current) {
              track.publication.track?.attach(cameraEl.current);
            }

            return;
          }

          if (videoEl.current) {
            track.publication.track?.attach(videoEl.current);
          }
        }
    );
  };
  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const value = +e.target.value;
    const isMuted = value === 0;

    console.log('onVolumeChange', value);

    setMuted(isMuted);
    setVolume(value);

    if (videoEl?.current) {
      videoEl.current.volume = value * 0.01;
      videoEl.current.muted = isMuted;
    }

    if (cameraEl?.current) {
      cameraEl.current.volume = value * 0.01;
      cameraEl.current.muted = isMuted;
    }
  };
  const onToggleMute = () => {
    const isMuted = !muted;

    console.log('onToggleMute', isMuted);

    setMuted(isMuted);
    setVolume(isMuted ? 0 : 50);

    if (videoEl?.current) {
      videoEl.current.volume = isMuted ? 0 : 0.5;
      videoEl.current.muted = isMuted;
    }

    if (cameraEl?.current) {
      cameraEl.current.volume = isMuted ? 0 : 0.5;
      cameraEl.current.muted = isMuted;
    }
  };
  const onFullScreen = useCallback(() => {
    console.log('onFullScreen');
    if (isFullScreen) {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullScreen(false);
    } else if (playerEl?.current) {
      playerEl.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullScreen(true);
    }
  }, [isFullScreen]);

  useEffect(() => {
    if (videoEl?.current) {
      videoEl.current.volume = volume * 0.01;
      videoEl.current.muted = muted;
    }

    if (cameraEl?.current) {
      cameraEl.current.volume = volume * 0.01;
      cameraEl.current.muted = muted;
    }

    initStream();
  }, []);

  return (
      <TooltipProvider delayDuration={300}>
        <div className="relative flex aspect-video bg-black border border-primary my-4" style={{position: 'relative'}}
             ref={playerEl}>
          <video ref={videoEl} width="100%"/>
          <video ref={cameraEl} width="25%"
                 className={`border border-primary ${!(isScreenShare && isCameraEnable) ? 'hidden' : ''}`}
                 style={{position: 'absolute', left: '0', bottom: '0', zIndex: 2}}/>
          <div className="absolute top-0 h-full w-full opacity-0 hover:opacity-100 hover:transition-all"
               style={{zIndex: 3}}>
            <div
                className="absolute bottom-0 flex h-14 w-full items-center justify-between bg-gradient-to-t from-neutral-900 px-4">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="text-white" onClick={onToggleMute}>
                      {muted ? (
                          <Icons.volumeOff className="h-6 w-6 hover:scale-110 hover:transition-all"/>
                      ) : (
                          <Icons.volumeOn className="h-6 w-6 hover:scale-110 hover:transition-all"/>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{muted ? "Unmute" : "Mute"}</TooltipContent>
                </Tooltip>
                <input
                    type="range"
                    onChange={onVolumeChange}
                    className="ml-1 h-0.5 w-24 cursor-pointer appearance-none rounded-full bg-white accent-white"
                    value={volume}
                />
              </div>
              <div className="flex items-center justify-center gap-4">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="text-white" onClick={onFullScreen}>
                      {isFullScreen ? (
                          <Icons.minimize className="h-5 w-5 hover:scale-110 hover:transition-all"/>
                      ) : (
                          <Icons.maximize className="h-5 w-5 hover:scale-110 hover:transition-all"/>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <StartAudio
              label="Click to allow audio playback"
              className="absolute top-0 h-full w-full bg-black bg-opacity-75 text-white z-10"
          />
        </div>
      </TooltipProvider>
  );
};
