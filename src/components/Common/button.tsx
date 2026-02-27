interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export const Button = ({
  label,
  onClick,
  variant = "primary",
}: ButtonProps) => {
  const styles =
    variant === "primary"
      ? "bg-main hover:bg-variant-main text-white"
      : "border border-main text-main hover:bg-light-opacity";

  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg transition-all duration-300 ${styles}`}
    >
      {label}
    </button>
  );
};
