export function Newsletter() {
  return (
    <section className="bg-crimson py-20 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="max-w-[600px] mx-auto px-10 text-center relative">
        <h2 className="serif text-[clamp(36px,5vw,52px)] font-light text-white mb-4 leading-[1.1]">
          Stay in the Cee Circle
        </h2>
        <p className="text-[12px] tracking-[1.5px] text-white/70 leading-[1.8] mb-9 font-light">
          New arrivals, colour stories, and occasion styling notes delivered straight to your inbox.
        </p>
        <form className="flex max-w-[440px] mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 p-4 border border-white/30 bg-white/10 text-white font-sans text-xs tracking-wide outline-none focus:border-gold placeholder:text-white/40"
          />
          <button className="px-6 py-4 bg-gold text-crimson-dark font-sans text-[10px] tracking-[2px] uppercase cursor-pointer font-semibold transition-colors duration-200 hover:bg-gold-light">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
