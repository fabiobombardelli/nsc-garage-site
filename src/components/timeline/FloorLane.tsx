import type { Ref } from "react";
import type { BarrierPoint, TrackGeometry } from "@/hooks/useDriftCar";

type FloorLaneProps = {
  geometry: TrackGeometry;
  pathRef: Ref<SVGPathElement>;
  tyreMarksRef: Ref<SVGGElement>;
  conesRef: Ref<SVGGElement>;
};

/** Pneus de cada tipo de barreira, em px a partir do centro dela. */
const TYRES: Record<BarrierPoint["kind"], { x: number; y: number }[]> = {
  // Muro de seis pneus pintados, enfileirados ao longo da curva.
  wall: [-35, -21, -7, 7, 21, 35].map((y) => ({ x: 0, y })),
  // Três pneus soltos, amontoados no canto.
  stack: [
    { x: -7, y: -6 },
    { x: 7, y: -6 },
    { x: 0, y: 6 },
  ],
};

/**
 * A pista no piso do box: asfalto preto com bordas brancas e uma faixa
 * central tracejada (o mesmo traçado desenhado em três camadas), a borracha
 * que o carro deixa, um cone listrado ao lado de cada marco e barreiras de
 * pneus do lado de fora das curvas.
 * Puramente decorativa: o conteúdo está na lista de marcos.
 */
export function FloorLane({ geometry, pathRef, tyreMarksRef, conesRef }: FloorLaneProps) {
  const { width, height, overhangTop, path, cones, barriers } = geometry;

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

      <g className="trackside">
        {barriers.map((barrier) => (
          <g
            key={barrier.id}
            className={`barrier barrier-${barrier.kind}`}
            transform={`translate(${barrier.x} ${barrier.y})`}
          >
            {TYRES[barrier.kind].map((tyre) => (
              <g
                key={`${tyre.x}-${tyre.y}`}
                className="tyre"
                transform={`translate(${tyre.x} ${tyre.y})`}
              >
                <circle className="tyre-tread" r="7" />
                <circle className="tyre-hole" r="2.75" />
              </g>
            ))}
          </g>
        ))}
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
