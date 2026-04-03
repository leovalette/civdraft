import type { CSSObjectWithLabel } from "react-select";

export const selectStyles = {
  // biome-ignore lint/suspicious/noExplicitAny: react-select style callbacks use generic state types
  control: (provided: CSSObjectWithLabel, state: any) => ({
    ...provided,
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
    "&:hover": {
      borderColor: "#9CA3AF",
    },
    boxShadow: state.isFocused
      ? "0 0 0 2px rgba(66, 153, 225, 0.3)"
      : undefined,
  }),
  // biome-ignore lint/suspicious/noExplicitAny: react-select style callbacks use generic state types
  option: (provided: CSSObjectWithLabel, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#BFDBFE" : undefined,
    color: state.isSelected ? "#1E3A8A" : undefined,
    "&:hover": {
      backgroundColor: "#BFDBFE",
      color: "#1E3A8A",
    },
  }),
};
