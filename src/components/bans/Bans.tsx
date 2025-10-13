import { Ban } from "./Ban";

type BansProps = {
  numberOfBans: number;
  bans: { src: string; name: string }[];
  isTeam2?: boolean;
};

export const Bans = ({ bans, numberOfBans, isTeam2 }: BansProps) => {
  const normalizedBans = Array.from(
    { length: numberOfBans },
    (_, index) => bans[index] ?? undefined,
  );

  return (
    <div className={`flex gap-6 ${isTeam2 ? "flex-row-reverse" : ""}`}>
      {normalizedBans.map((ban, index) => {
        return (
          <div
            key={index}
            className={`flex gap-1 ${isTeam2 ? "flex-row-reverse" : ""}`}
          >
            <Ban leader={ban} currentBan={false} />
          </div>
        );
      })}
    </div>
  );
};
