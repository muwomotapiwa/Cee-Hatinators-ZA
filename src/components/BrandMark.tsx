interface BrandMarkProps {
  tone?: 'dark' | 'light';
}

export function BrandMark({ tone = 'dark' }: BrandMarkProps) {
  const isLight = tone === 'light';

  return (
    <span className="inline-flex items-center gap-3">
      <span
        className={`serif flex h-11 w-11 items-center justify-center border text-[19px] font-light italic leading-none ${
          isLight
            ? 'border-gold/70 text-gold-light'
            : 'border-crimson text-crimson'
        }`}
      >
        C
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`serif text-[24px] font-light tracking-[0px] ${
            isLight ? 'text-offwhite' : 'text-dark'
          }`}
        >
          Cee
        </span>
        <span
          className={`text-[9px] uppercase tracking-[2.8px] ${
            isLight ? 'text-mauve' : 'text-charcoal'
          }`}
        >
          Hatinators
        </span>
      </span>
    </span>
  );
}
