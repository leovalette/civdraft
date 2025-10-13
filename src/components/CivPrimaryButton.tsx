type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};
export const CivPrimaryButton = ({
  children,
  onClick,
  disabled = false,
}: ButtonProps) => (
  <div
    className={`${
      disabled
        ? "border-[#867e6f] bg-[#35312b]"
        : "border-golden-border bg-bg-golden-border"
    }  flex items-center justify-center border-2`}
  >
    <button
      type="button"
      className={`h-8 rounded-2xl px-8 ${
        disabled
          ? "border-[#867e6f] bg-[#0d1a20]"
          : "border-golden-border bg-validation hover:bg-hover-validation"
      } border-2 font-extrabold  text-text-validation`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  </div>
);
