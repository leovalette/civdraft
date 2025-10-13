import Image from "next/image";
import { useRef } from "react";
import { animated, useSpring } from "react-spring";

type BanLeaderProps = {
  leader?: { src: string; name: string };
  currentBan: boolean;
};
export const Ban = ({ leader, currentBan }: BanLeaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const props = useSpring({
    to: async (next) => {
      await next({ opacity: 1, transform: "scale(1.5)" });
      await next({
        transform: "scale(1)",
      });
    },
    from: {
      transform: "scale(0)",
    },
    config: { tension: 300, friction: 20 },
  });

  return (
    <div
      ref={containerRef}
      className={`h-28 w-28 flex-wrap rounded-full sm:h-12 sm:w-12 md:h-16 md:w-16  lg:h-20 lg:w-20 xl:h-28 xl:w-28 ${
        leader?.src ? "" : "border-2  border-border bg-background-dark"
      }  flex items-center justify-center
    text-center ${currentBan ? "bg-golden-border text-border" : ""}`}
    >
      {leader ? (
        currentBan ? (
          <animated.div style={props}>
            <Image
              className="flex h-28 w-28 items-center justify-center rounded-full sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-28 xl:w-28 "
              src={`/leaders/${leader.src}`}
              alt={leader.name ?? "Waiting for ban"}
            ></Image>
          </animated.div>
        ) : (
          <Image
            className="flex h-28 w-28 items-center justify-center rounded-full sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-28 xl:w-28"
            src={leader.src}
            alt={leader.name ?? "Waiting for ban"}
          ></Image>
        )
      ) : (
        <div>?</div>
      )}
    </div>
  );
};
