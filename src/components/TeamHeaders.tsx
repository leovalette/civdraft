import { useMemo } from "react";

const getDraftStatus = (
  team1: string,
  team2: string,
  currentStatus: `${"PICK" | "BAN" | "MAPBAN"}${number}`,
  numberOfBansFirstRotation: number,
) => {
  if (!currentStatus) {
    return "Waiting for players...";
  }
  if (currentStatus.startsWith("MAPBAN")) {
    return Number(currentStatus.replace("MAPBAN", "")) % 2 === 1
      ? `${team1} is banning a map`
      : `${team2} is banning a map`;
  }
  if (currentStatus.startsWith("PICK")) {
    return ["PICK1", "PICK4", "PICK6", "PICK7"].includes(currentStatus)
      ? `${team1} is picking`
      : `${team2} is picking`;
  }
  const banNumber = Number(currentStatus.replace("BAN", ""));
  if (banNumber > numberOfBansFirstRotation) {
    return banNumber % 2 === 1
      ? `${team2} is banning a leader`
      : `${team1} is banning a leader`;
  }
  return banNumber % 2 === 1
    ? `${team1} is banning a leader`
    : `${team2} is banning a leader`;
};

type TeamHeadersProps = {
  team1: string;
  team2: string;
  currentStatus: `${"PICK" | "BAN" | "MAPBAN"}${number}`;
  numberOfBansFirstRotation: number;
};
export const TeamHeaders = ({
  team1,
  team2,
  currentStatus,
  numberOfBansFirstRotation,
}: TeamHeadersProps) => {
  const teamSelecting = useMemo<"TEAM1" | "TEAM2" | undefined>(() => {
    const statusNumber = Number(currentStatus.slice(-1));
    if (Number.isNaN(statusNumber)) {
      return undefined;
    }
    return !Number.isNaN(statusNumber) && statusNumber % 2 === 1
      ? "TEAM1"
      : "TEAM2";
  }, [currentStatus]);

  const status = useMemo<string | undefined>(
    () =>
      getDraftStatus(team1, team2, currentStatus, numberOfBansFirstRotation),
    [currentStatus, team1, team2, numberOfBansFirstRotation],
  );

  return (
    <div className="flex items-center justify-between uppercase text-white">
      <div
        className={`w-1/3 rounded-md border-2 border-border bg-team1 p-2 text-right sm:p-1 md:p-1 lg:p-2 xl:p-2 ${
          teamSelecting === "TEAM1" ? "border-golden-border" : ""
        }`}
      >
        <span>{team1}</span>
      </div>
      <div className="w-1/5">
        <div className="rounded-md border-2 bg-border p-2 text-center sm:p-1 md:p-1 lg:p-2 xl:p-2">
          {status}
        </div>
      </div>
      <div
        className={`w-1/3 rounded-md border-2 border-border bg-team2 p-2 sm:p-1 md:p-1 lg:p-2 xl:p-2 ${
          teamSelecting === "TEAM2" ? "border-golden-border" : ""
        }`}
      >
        <span>{team2}</span>
      </div>
    </div>
  );
};
