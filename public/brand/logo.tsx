type LogoProps = {
  variant?: "default" | "light" | "mono" | "tagline";
  className?: string;
};

const logoSrc = {
  default: "/brand/microatlas-logo-horizontal.svg",
  light: "/brand/microatlas-logo-horizontal-light.svg",
  mono: "/brand/microatlas-logo-horizontal-mono.svg",
  tagline: "/brand/microatlas-logo-with-tagline.svg",
};

export function Logo({ variant = "default", className = "" }: LogoProps) {
  return (
    <img
      src={logoSrc[variant]}
      alt="MicroAtlas"
      className={className}
    />
  );
}