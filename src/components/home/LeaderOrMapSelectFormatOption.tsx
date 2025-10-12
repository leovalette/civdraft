import Image from "next/image"
import type { FC } from "react"

type Props = { leaderOrMap: { name: string; src: string }, type: 'leaders' | 'maps' }
export const LeaderOrMapSelectFormatOption: FC<Props> = ({ leaderOrMap, type }) => (
    <div className="flex items-center">
        <Image
            src={`/${type}/${leaderOrMap.src}`}
            width={32}
            height={32}
            className="mr-2 h-8 w-8"
            alt={leaderOrMap.name}
        />
        <span className="text-sm">{leaderOrMap.name}</span>
    </div>
)
