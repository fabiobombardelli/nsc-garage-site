import type { Ref } from "react";
import type { TrackGeometry } from "@/hooks/useDriftCar";

type RaceTrackProps = {
  geometry: TrackGeometry;
  pathRef: Ref<SVGPathElement>;
  tyreMarksRef: Ref<SVGGElement>;
  clippingRef: Ref<SVGGElement>;
};

/**
 * Pista desenhada atrás dos marcos: asfalto, faixa central, a borracha que
 * o carro deixa ao passar e um clipping point ao lado de cada marco.
 */
export function RaceTrack({ geometry, pathRef, tyreMarksRef, clippingRef }: RaceTrackProps) {
  const { width, height, overhangTop, path, clippingPoints } = geometry;

  return (
    <svg
      className="race-track"
      style={{ top: -overhangTop }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <path ref={pathRef} className="race-track-asphalt" d={path} />
      <path className="race-track-paint" d={path} />

      {/* Duas faixas de borracha, uma para cada pneu traseiro. */}
      <g ref={tyreMarksRef} className="race-track-rubber">
        <path className="rubber-left" d={path} />
        <path className="rubber-right" d={path} />
      </g>

      <g ref={clippingRef}>
        {clippingPoints.map((point) => (
          <g
            key={point.id}
            className="clipping-point"
            data-y={point.y}
            transform={`translate(${point.x} ${point.y})`}
          >
            <circle className="clipping-point-ring" r="18" />
            <circle className="clipping-point-cone" r="7" />
          </g>
        ))}
      </g>
    </svg>
  );
}
