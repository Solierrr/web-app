import Canvas from "./Canvas";

export default function SideCanvas({ centerWidth = "24rem", centerHeight }: { centerWidth?: string; centerHeight?: string }) {
  const width = `max(0px, calc((100% - ${centerWidth}) / 2))`;
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      {centerHeight &&
        (["top", "bottom"] as const).map((side) => (
          <div
            key={side}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ [side]: 0, width: `min(100%, ${centerWidth})`, height: `max(0px, calc((100% - ${centerHeight}) / 2))` }}>
            <Canvas
              variant="grid"
              interactionScope="page"
              backgroundColor="var(--color-operational-surface)"
              style={{ maskImage: side === "top" ? "linear-gradient(to bottom, black, transparent)" : "linear-gradient(to top, black, transparent)" }}
            />
          </div>
        ))}
      <div className="absolute inset-y-0 left-0 hidden sm:block" style={{ width }}>
        <Canvas
          variant="grid"
          interactionScope="page"
          backgroundColor="var(--color-operational-surface)"
          style={{ maskImage: "linear-gradient(to right, black, transparent)" }}
        />
      </div>
      <div className="absolute inset-y-0 right-0 hidden sm:block" style={{ width }}>
        <Canvas variant="grid" interactionScope="page" backgroundColor="var(--color-operational-surface)" />
      </div>
    </div>
  );
}
