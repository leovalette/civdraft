import type { FC } from "react"
import Select, { type SingleValue } from "react-select"
import { selectStyles } from "./selectStyles"

type Props = { presets: { id: string, label: string }[]; preset: { id: string, label: string } | null; onChangePreset: (e: { presetId: string, label: string | null }) => void }
export const SelectMode: FC<Props> = ({ presets, preset, onChangePreset }) => (
    <div>
        <div className="text-lg font-semibold ">Preset</div>
        <Select
            instanceId="select-mode"
            options={presets}
            onChange={(e: SingleValue<{ id: string, label: string }>) => {
                onChangePreset({ presetId: e?.id ?? "", label: e?.label ?? null })
            }}
            value={preset}
            isSearchable={false}
            classNamePrefix="react-select"
            styles={selectStyles}
        />
    </div>
)
