type BrandMarkProps = {
  variant?: "default" | "light";
  className?: string;
};

const markSrc = {
  default: "/brand/microatlas-mark.svg",
  light: "/brand/microatlas-mark-light.svg",
};

export function BrandMark({ variant = "default", className = "" }: BrandMarkProps) {
  return (
    <img
      src={markSrc[variant]}
      alt=""
      aria-hidden="true"
      className={className}
    />
  );
}