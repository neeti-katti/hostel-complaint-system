// Decorative brown crest panel shown beside the auth forms.
export default function CrestPanel({ tagline }) {
  return (
    <div
      className="hidden md:flex flex-col justify-center p-10 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#6b5446 0%,#4a3a2e 100%)' }}
    >
      <div className="w-14 h-14 rounded-full grid place-items-center border border-blush/70 text-blush mb-6">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-6 h-6">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <h2 className="font-serif text-3xl leading-snug">
        Hostel
        <br />
        Services
      </h2>
      <p className="text-sm mt-4 leading-relaxed text-white/70">
        {tagline || 'Report, track and resolve hostel matters with quiet ease.'}
      </p>
      <span className="text-[10px] uppercase tracking-[0.3em] text-blush/80 mt-8">
        — Since 2026 —
      </span>
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-blush/10" />
    </div>
  );
}
