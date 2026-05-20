interface BrandMarkProps {
  tone?: 'dark' | 'light';
}

export function BrandMark({ tone = 'dark' }: BrandMarkProps) {
  const logoSrc = `${import.meta.env.BASE_URL}images/ceehatinators-logo.jpeg`;
  const frameTone = tone === 'light' ? 'border-crimson' : 'border-crimson';

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden border bg-white p-1 ${frameTone}`}
    >
      <img
        src={logoSrc}
        alt="Cee Hatinators"
        className="h-11 w-[120px] object-contain md:h-16 md:w-[190px]"
      />
    </span>
  );
}
