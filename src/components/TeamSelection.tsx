import { SelectBox } from "./SelectBox";

type TeamSelectionProps = {
  leaderOrMaps: {
    id: string;
    name: string;
    imageName: string;
    type: "leader" | "map";
  }[];
  numberOfPicks: number;
};
export const TeamSelection = ({
  leaderOrMaps,
  numberOfPicks,
}: TeamSelectionProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {Array.from({ length: numberOfPicks }).map((_, index) => (
          <SelectBox
            key={leaderOrMaps[index]?.id ?? index}
            leaderOrMap={leaderOrMaps[index]}
            currentPick={false}
          />
        ))}
      </div>
    </div>
  );
};
