interface InstructionsProps {
  items: string[];
  className?: string;
}

export default function Instructions({ items, className = "" }: InstructionsProps) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {items.map((item, index) => (
        <kbd key={`${item}-${index}`} className="rounded-soft bg-white px-1.5 py-0.5 font-[inherit] text-lower text-operational-muted shadow-sm">
          {item}
        </kbd>
      ))}
    </span>
  );
}
