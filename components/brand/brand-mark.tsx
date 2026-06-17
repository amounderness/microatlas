type BrandMarkVariant = "default";

type BrandMarkProps = {
  variant?: BrandMarkVariant;
  className?: string;
};

const markSrc: Record<BrandMarkVariant, string> = {
  default: "/brand/microatlas-mark.svg",
};

export function BrandMark({ variant = "default", className = "" }: BrandMarkProps) {
  return (
    <img
      src={markSrc[variant]}
      alt=""
      aria-hidden="true"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}