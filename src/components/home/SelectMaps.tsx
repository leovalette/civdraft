import type { FC } from "react";
import Select, { type MultiValue } from "react-select";
import { LeaderOrMapSelectFormatOption } from "./LeaderOrMapSelectFormatOption";

const filterOptions = (
  candidate: {
    label: string;
    value: string;
    data: { name: string; src: string; _id: string };
  },
  search: string,
) => {
  return candidate.data.name.toLowerCase().includes(search.toLowerCase());
};

type Props = {
  selectedMaps: { name: string; src: string; _id: string }[];
  setSelectedMaps: (
    selectedMaps: { name: string; src: string; _id: string }[],
  ) => void;
  maps: { name: string; src: string; _id: string }[];
};

export const SelectMaps: FC<Props> = ({
  selectedMaps,
  setSelectedMaps,
  maps,
}) => (
  <div>
    <div className="text-lg font-semibold ">Maps to draft</div>
    <Select
      instanceId="select-maps"
      options={maps}
      placeholder="Select map"
      value={selectedMaps}
      onChange={(
        map: MultiValue<{ name: string; src: string; _id: string }>,
      ) => {
        setSelectedMaps(map as { name: string; src: string; _id: string }[]);
      }}
      formatOptionLabel={(map) => (
        <LeaderOrMapSelectFormatOption leaderOrMap={map} type="maps" />
      )}
      isSearchable={true}
      getOptionValue={(map) => map.name}
      filterOption={filterOptions}
      isMulti
      classNamePrefix="react-select"
    />
  </div>
);
