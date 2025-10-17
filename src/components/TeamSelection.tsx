import { SelectBox } from "./SelectBox";

type TeamSelectionProps = {
  leaderOrMaps: {
    id: string;
    name: string;
    imageName: string;
    type: "leader" | "map";
  }[];
  numberOfPicks: number;
  currentStatus: `${"PICK" | "BAN" | "MAPBAN"}${number}`;
  statuses: `${"PICK" | "BAN" | "MAPBAN"}${number}`[];
};
export const TeamSelection = ({
  leaderOrMaps,
  numberOfPicks,
  currentStatus,
  statuses,
}: TeamSelectionProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {Array.from({ length: numberOfPicks }).map((_, index) => (
          <SelectBox
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={leaderOrMaps[index]?.id + index}
            leaderOrMap={leaderOrMaps[index]}
            currentPick={currentStatus === statuses[index]}
          />
        ))}
      </div>
    </div>
  );
};
