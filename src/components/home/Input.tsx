import type { ChangeEvent, FC } from "react"

type Props = {
    label: string
    value: string
    setValue: (value: string) => void
}
export const Input: FC<Props> = ({ label, setValue, value }) => {
    const id = label.replace(/\s+/g, "-").toLowerCase()
    return (
        <div>
            <label htmlFor={id} className="text-lg font-semibold ">{label}</label>
            <input
                id={id}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setValue(e.target.value)
                }}
            />
        </div>
    )
}
