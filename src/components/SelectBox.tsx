import Image from "next/image";

type SelectBoxProps = {
	leaderOrMap?: {
		id: string;
		name: string;
		imageName: string;
		type: "leader" | "map";
	};
	currentPick: boolean;
};
export const SelectBox = ({ leaderOrMap, currentPick }: SelectBoxProps) => {
	return (
		<div
			className={`flex h-32 w-80 items-center justify-center rounded-md  border-2 border-border bg-background-dark sm:h-12 sm:w-40 md:h-24 md:w-60 lg:h-24 lg:w-60 xl:h-32 xl:w-80 ${
				currentPick ? "bg-golden-border text-border" : ""
			}`}
		>
			{leaderOrMap ? (
				<Image
					className="flex h-28 w-28 items-center justify-center rounded-xl text-center sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-28 xl:w-28"
					src={`/${leaderOrMap.type === "leader" ? "leaders" : "maps"}/${leaderOrMap.imageName}`}
					alt={leaderOrMap.name}
					width={48}
					height={48}
				/>
			) : (
				<div>Waiting for selection</div>
			)}
		</div>
	);
};
