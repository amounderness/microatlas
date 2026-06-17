type LogoVariant = "default" | "light" | "mono" | "monoLight" | "tagline";

type LogoProps = {
  variant?: LogoVariant;
  className?: string;
};

const logoSrc: Record<LogoVariant, string> = {
  default: "/brand/microatlas-logo-horizontal.svg",
  light: "/brand/microatlas-logo-horizontal-light.svg",
  mono: "/brand/microatlas-logo-horizontal-mono.svg",
  monoLight: "/brand/microatlas-logo-horizontal-mono-light.svg",
  tagline: "/brand/microatlas-logo-with-tagline.svg",
};

export function Logo({ variant = "default", className = "" }: LogoProps) {
  return (
    <img
      src={logoSrc[variant]}
      alt="MicroAtlas"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}