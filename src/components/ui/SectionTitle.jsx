export function SectionTitle({ eyebrow, title, meta }) {
  return (
    <div className="mb-4">
      {eyebrow ? (
        <div className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-info">
          {eyebrow}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-black uppercase tracking-[0.12em] text-text-primary">
          {title}
        </h2>
        {meta ? <div className="text-[10px] font-bold text-text-secondary">{meta}</div> : null}
      </div>
    </div>
  )
}
