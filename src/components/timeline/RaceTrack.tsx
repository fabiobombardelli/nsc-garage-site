import type { Ref } from "react";
import { TRACK_PATH, TRACK_VIEWBOX } from "@/lib/track";

type RaceTrackProps = {
  svgRef: Ref<SVGSVGElement>;
  pathRef: Ref<SVGPathElement>;
};

/** Pista em "S" desenhada atrás dos cards da linha do tempo. */
export function RaceTrack({ svgRef, pathRef }: RaceTrackProps) {
  return (
    <svg
      ref={svgRef}
      className="race-track"
      viewBox={`0 0 ${TRACK_VIEWBOX.width} ${TRACK_VIEWBOX.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path ref={pathRef} className="race-track-asphalt" d={TRACK_PATH} />
      <path className="race-track-center-line" d={TRACK_PATH} />
    </svg>
  );
}
