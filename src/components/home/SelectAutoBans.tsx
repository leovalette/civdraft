import type { FC } from "react";
import Select, { type MultiValue } from "react-select";
import { LeaderOrMapSelectFormatOption } from "./LeaderOrMapSelectFormatOption";
import { selectStyles } from "./selectStyles";

const filterOptions = (
  candidate: {
    label: string;
    value: string;
    data: { name: string; src: string; id: string };
  },
  search: string,
) => {
  return candidate.data.name.toLowerCase().includes(search.toLowerCase());
};

type Props = {
  bannableLeaders: { name: string; src: string; id: string }[];
  bansCiv: { name: string; id: string; src: string }[];
  setBansCiv: (bansCiv: { name: string; id: string; src: string }[]) => void;
};
export const SelectAutobans: FC<Props> = ({
  bansCiv,
  setBansCiv,
  bannableLeaders,
}) => (
  <div>
    <div className="text-lg font-semibold ">Autoban civs</div>
    <Select
      instanceId="select-autobans"
      options={[...bannableLeaders].sort((a, b) =>
        a.name.localeCompare(b.name),
      )}
      placeholder="Select ban"
      value={bansCiv}
      onChange={(
        leader: MultiValue<{ name: string; id: string; src: string }>,
      ) => {
        setBansCiv(leader as { name: string; id: string; src: string }[]);
      }}
      isSearchable={true}
      formatOptionLabel={(leader) => (
        <LeaderOrMapSelectFormatOption leaderOrMap={leader} type="leaders" />
      )}
      getOptionValue={(leader) => leader.name}
      filterOption={filterOptions}
      isMulti
      classNamePrefix="react-select"
      styles={selectStyles}
    />
  </div>
);
