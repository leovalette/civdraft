import Image from "next/image";
import { useCallback } from "react";

type LeaderOrMapProps = {
  leaderOrMap: {
    id: string;
    name: string;
    imageName: string;
    pickBanType:
      | "PICKT1"
      | "PICKT2"
      | "BANT1"
      | "BANT2"
      | "AUTOBAN"
      | "AVAILABLE";
  };
  onClick?: () => void;
  type?: "leader" | "map";
};

export const LeaderOrMap = ({
  leaderOrMap,
  onClick,
  type = "leader",
}: LeaderOrMapProps) => {
  const background =
    leaderOrMap.pickBanType === "PICKT1"
      ? "bg-team1"
      : leaderOrMap.pickBanType === "PICKT2"
        ? "bg-team2"
        : leaderOrMap.pickBanType === "BANT1"
          ? "bg-team1"
          : leaderOrMap.pickBanType === "BANT2"
            ? "bg-team2"
            : leaderOrMap.pickBanType === "AUTOBAN"
              ? "bg-[#000000]"
              : "bg-background-dark";

  const crossed =
    leaderOrMap.pickBanType === "BANT1" ||
    leaderOrMap.pickBanType === "BANT2" ||
    leaderOrMap.pickBanType === "AUTOBAN"
      ? "cross-container"
      : "";
  const cursor =
    leaderOrMap.pickBanType === "AVAILABLE" ? "cursor-pointer" : "";
  const clickOrNotToClick = useCallback(() => {
    if (onClick && leaderOrMap.pickBanType === "AVAILABLE") {
      onClick();
    }
  }, [onClick, leaderOrMap.pickBanType]);
  return (
    <div
      className={`flex h-44 w-28 flex-col items-center border-border sm:h-24 sm:w-16 md:h-36 md:w-24 lg:h-36 lg:w-24 xl:h-44 xl:w-28 ${background} overflow-hidden rounded-xl p-1`}
    >
      <div
        className={`flex h-28 w-28 flex-wrap items-center justify-center rounded-xl text-center sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-28 xl:w-28 ${cursor} ${crossed}`}
      >
        <Image
          className="flex h-28 w-28 items-center justify-center rounded-xl text-center sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-28 xl:w-28"
          src={`/${type === "leader" ? "leaders" : "maps"}/${leaderOrMap.imageName}`}
          alt={leaderOrMap.name}
          onClick={clickOrNotToClick}
          width={48}
          height={48}
        />
      </div>
      <div
        style={{ height: "inherit" }}
        className="flex items-center justify-center px-2"
      >
        <div className="text-center text-xs">{leaderOrMap.name}</div>
      </div>
    </div>
  );
};
