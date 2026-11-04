/**
 * Geometria da pista em "S" da linha do tempo.
 *
 * O desenho é feito num sistema de coordenadas fixo (viewBox 360 × 3000)
 * e esticado via CSS para ocupar toda a altura da seção.
 */
export const TRACK_VIEWBOX = { width: 360, height: 3000 } as const;

export const TRACK_PATH =
  "M180 0 C75 130 75 270 180 380 S285 650 180 760 S75 1030 180 1140 S285 1410 180 1520 " +
  "S75 1790 180 1900 S285 2170 180 2280 S75 2550 180 2660 S285 2890 180 3000";

/** Ângulo extra (graus) aplicado ao carro: base nas retas + máximo nas curvas. */
const DRIFT_BASE_ANGLE = 10;
const DRIFT_MAX_EXTRA_ANGLE = 31;
/** Quanto a curvatura da pista amplifica a "força" do drift (0–1). */
const DRIFT_SENSITIVITY = 3.6;

const toDegrees = (radians: number) => (radians * 180) / Math.PI;
const angleBetween = (a: DOMPoint, b: DOMPoint) => Math.atan2(b.y - a.y, b.x - a.x);

/** Encontra, por busca binária, o ponto do traçado cuja altura (y) é `targetY`. */
function lengthAtY(path: SVGPathElement, targetY: number, totalLength: number): number {
  let low = 0;
  let high = totalLength;
  for (let i = 0; i < 12; i += 1) {
    const middle = (low + high) / 2;
    if (path.getPointAtLength(middle).y < targetY) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

export type CarPose = {
  /** Posição no sistema de coordenadas do viewBox. */
  x: number;
  y: number;
  /** Rotação final do carro, em graus. */
  rotation: number;
  /** Intensidade do drift, de 0 (reta) a 1 (curva fechada). */
  driftForce: number;
  /** -1 ou 1: lado para onde a traseira escorrega. */
  driftDirection: number;
};

/** Calcula posição e atitude do carro para uma altura `targetY` da pista. */
export function getCarPose(path: SVGPathElement, targetY: number): CarPose {
  const totalLength = path.getTotalLength();
  const length = lengthAtY(path, targetY, totalLength);
  const at = (offset: number) =>
    path.getPointAtLength(Math.min(totalLength, Math.max(0, length + offset)));

  const step = Math.min(28, totalLength * 0.01);
  const point = at(0);
  const heading = toDegrees(angleBetween(at(-step), at(step)));

  const angleIn = angleBetween(at(-step * 2), point);
  const angleOut = angleBetween(point, at(step * 2));
  const curvature = Math.atan2(Math.sin(angleOut - angleIn), Math.cos(angleOut - angleIn));

  const driftDirection = Math.sign(curvature || 1);
  const driftForce = Math.min(1, Math.abs(curvature) * DRIFT_SENSITIVITY);
  const driftAngle = driftDirection * (DRIFT_BASE_ANGLE + driftForce * DRIFT_MAX_EXTRA_ANGLE);

  // A imagem do carro tem a dianteira para baixo; -90° alinha a dianteira com o sentido da pista.
  return {
    x: point.x,
    y: point.y,
    rotation: heading - 90 + driftAngle,
    driftForce,
    driftDirection,
  };
}
