import { Ban } from "./Ban";

type BansProps = {
  numberOfBans: number;
  bans: Array<{ src: string; name: string } | undefined>;
  isTeam2?: boolean;
  draftStatus: { type: "PICK" | "BAN" | "MAPBAN"; index: number };
  offset?: number;
  isOdd?: boolean;
};

export const Bans = ({
  bans,
  numberOfBans,
  isTeam2,
  draftStatus,
  offset = 0,
  isOdd = false,
}: BansProps) => {
  const normalizedBans = Array.from(
    { length: numberOfBans },
    (_, index) => bans[index + offset] ?? undefined,
  );

  return (
    <div className={`flex gap-6 ${isTeam2 ? "flex-row-reverse" : ""}`}>
      {normalizedBans.map((ban, index) => {
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: Needed for undefined bans
            key={String(ban?.name) + index}
            className={`flex gap-1 ${isTeam2 ? "flex-row-reverse" : ""}`}
          >
            <Ban
              leader={ban}
              currentBan={
                draftStatus.type !== "BAN"
                  ? false
                  : isOdd
                    ? index + offset === (draftStatus.index - 2) / 2
                    : index + offset === (draftStatus.index - 1) / 2
              }
            />
          </div>
        );
      })}
    </div>
  );
};
