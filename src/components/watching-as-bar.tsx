interface Props {
  viewerName: string;
}

export default function WatchingAsBar({ viewerName }: Props) {
  return (
    <div className="py-2 text-center text-xs bg-primary text-primary-foreground">
      Watching as <span className="font-bold">{viewerName}</span>
    </div>
  );
}
