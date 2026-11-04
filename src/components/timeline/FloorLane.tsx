import type { Ref } from "react";
import type { TrackGeometry } from "@/hooks/useDriftCar";

type FloorLaneProps = {
  geometry: TrackGeometry;
  pathRef: Ref<SVGPathElement>;
  tyreMarksRef: Ref<SVGGElement>;
  conesRef: Ref<SVGGElement>;
};

/**
 * A pista no piso do box: asfalto preto com bordas brancas e uma faixa
 * central tracejada (o mesmo traçado desenhado em três camadas), a borracha
 * que o carro deixa e um cone listrado ao lado de cada marco.
 * Puramente decorativa: o conteúdo está na lista de marcos.
 */
export function FloorLane({ geometry, pathRef, tyreMarksRef, conesRef }: FloorLaneProps) {
  const { width, height, overhangTop, path, cones } = geometry;

  return (
    <svg
      className="floor-lane"
      style={{ top: -overhangTop }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      <path ref={pathRef} className="floor-lane-edge" d={path} />
      <path className="floor-lane-asphalt" d={path} />
      <path className="floor-lane-centre" d={path} />

      {/* Duas faixas de borracha, uma para cada pneu traseiro. */}
      <g ref={tyreMarksRef} className="floor-lane-rubber">
        <path className="rubber-left" d={path} />
        <path className="rubber-right" d={path} />
      </g>

      <g ref={conesRef}>
        {cones.map((cone) => (
          <g
            key={cone.id}
            className="cone"
            data-y={cone.y}
            transform={`translate(${cone.x} ${cone.y})`}
          >
            <rect className="cone-base" x="-12" y="-12" width="24" height="24" />
            <circle className="cone-body" r="10" />
            <circle className="cone-band" r="6.5" />
            <circle className="cone-tip" r="3.25" />
            <circle className="cone-ring" r="16" />
          </g>
        ))}
      </g>
    </svg>
  );
}
