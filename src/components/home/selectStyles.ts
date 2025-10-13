export const selectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
    "&:hover": {
      borderColor: "#9CA3AF",
    },
    boxShadow: state.isFocused ? "0 0 0 2px rgba(66, 153, 225, 0.3)" : null,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#BFDBFE" : null,
    color: state.isSelected ? "#1E3A8A" : null,
    "&:hover": {
      backgroundColor: "#BFDBFE",
      color: "#1E3A8A",
    },
  }),
};
