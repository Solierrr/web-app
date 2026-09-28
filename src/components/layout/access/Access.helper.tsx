import { useEffect, useRef } from "react";

interface Style {
    className?: string;
    style?: string;
}

function Rectangle() {
    return (
        <div
            className="w-18 h-36 shrink-0 rounded-xl bg-linear-to-br from-orange to-dark-orange cursor-pointer
                       transition-transform duration-200 ease-out will-change-transform
                       hover:transform-[translateZ(100px)_scale(1.15)] hover:shadow-2xl hover:shadow-black/50 hover:brightness-110"
        />
    );
}

const TILES_PER_GROUP = 5;
const GROUPS = 4;

function RectanglesColumn({ className }: Style) {
    const columnRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let position = 0;
        let animationFrame: number;

        function animate() {
            const column = columnRef.current;
            if (!column) return;

            position -= 0.5;
            if (Math.abs(position) >= column.scrollHeight / GROUPS) { position = 0; }

            column.style.transform = `translateY(${position}px)`;
            animationFrame = requestAnimationFrame(animate);
        }

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <div className={`h-screen ${className}`}>
            <div ref={columnRef} className="flex h-max flex-col gap-4 transform-3d">
                {Array.from({ length: GROUPS }).flatMap((_, group) =>
                    Array.from({ length: TILES_PER_GROUP }, (_, i) => (
                        <Rectangle key={`${group}-${i}`} />
                    )),
                )}
            </div>
        </div>
    );
}

export function AnimatedBackground({ className }: Style) {
    return (
        <section
            className={`relative overflow-hidden bg-[radial-gradient(circle,#d1d5db_1px,transparent_1px)] bg-size-[15px_15px] ${className}`}
            style={{ perspective: "1600px", perspectiveOrigin: "40% 145%" }}
        >
            <div
                className="absolute inset-0 flex flex-row gap-4 justify-end transform-3d"
                style={{ transform: "scale(2.2) rotateX(55deg) rotateZ(35deg)", transformOrigin: "100% 100%" }}
            >
                {Array.from({ length: 4 }, (_, i) => (
                    <RectanglesColumn key={i} />
                ))}
            </div>
        </section>
    );
}