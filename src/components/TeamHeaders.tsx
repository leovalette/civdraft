import { useEffect, useMemo } from "react"
import { animated, useSpring } from "react-spring"

const getDraftStatus = (
  team1: string,
  team2: string,
  currentStatus: `${'PICK' | 'BAN' | 'MAPBAN'}${number}`
) => {
  if (!currentStatus) {
    return 'Waiting for players...'
  }
  if (currentStatus.startsWith('MAPBAN')) {
    return Number(currentStatus.replace("MAPBAN", "")) % 2 === 1 ? `${team1} is banning a map` : `${team2} is banning a map`
  }
  if (currentStatus.startsWith('PICK')) {
    return Number(currentStatus.replace("PICK", "")) % 2 === 1 ? `${team1} is picking` : `${team2} is picking`
  }
}


type TeamHeadersProps = {
  team1: string
  team2: string
  currentStatus: `${'PICK' | 'BAN' | 'MAPBAN'}${number}`
}
export const TeamHeaders = ({
  team1,
  team2,
  currentStatus,
}: TeamHeadersProps) => {
  const [style, set] = useSpring(() => ({ transform: "scale(1.5)" }))

  useEffect(() => {
    set({
      from: { transform: "scale(1.5)" },
      to: { transform: "scale(1)" },
      reset: true,
      config: { mass: 5 },
    })
  }, [currentStatus, set])

  const teamSelecting = useMemo<'TEAM1' | 'TEAM2' | undefined>(
    () => {
      const statusNumber = Number(currentStatus.slice(-1))
      if (isNaN(statusNumber)) {
        return undefined
      }
      return !isNaN(statusNumber) && statusNumber % 2 === 1 ? 'TEAM1' : 'TEAM2'
    },
    [currentStatus],
  )

  const status = useMemo<string | undefined>(
    () => getDraftStatus(team1, team2, currentStatus),
    [currentStatus, team1],
  )

  return (
    <div className="flex items-center justify-between uppercase text-white">
      <div
        className={`w-1/3 rounded-md border-2 border-border bg-team1 p-2 text-right sm:p-1 md:p-1 lg:p-2 xl:p-2 ${teamSelecting === 'TEAM1' ? "border-golden-border" : ""
          }`}
      >
        <span>{team1}</span>
      </div>
      <animated.div style={style} className={"w-1/5"}>
        <div className="rounded-md border-2 bg-border p-2 text-center sm:p-1 md:p-1 lg:p-2 xl:p-2">
          {status}
        </div>
      </animated.div>
      <div
        className={`w-1/3 rounded-md border-2 border-border bg-team2 p-2 sm:p-1 md:p-1 lg:p-2 xl:p-2 ${teamSelecting === 'TEAM2' ? "border-golden-border" : ""
          }`}
      >
        <span>{team2}</span>
      </div>
    </div>
  )
}
