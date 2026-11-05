/**
 * Geometria da pista da Trajetória.
 *
 * O traçado é montado em tempo real a partir da posição de cada marco:
 * cada marco vira o ápice de uma curva, alternando de lado. Tudo em
 * pixels da própria seção, sem esticar o desenho.
 */

export type TrackPoint = { x: number; y: number };

/** Ângulo extra (graus) do carro: um mínimo nas retas e um máximo nas curvas fechadas. */
const DRIFT_BASE_ANGLE = 10;
const DRIFT_MAX_EXTRA_ANGLE = 31;
/** Quanto a curvatura da pista amplifica a "força" do drift (0–1). */
const DRIFT_SENSITIVITY = 3.6;

/**
 * Liga os pontos com curvas suaves. A tangente é vertical em cada ponto,
 * então cada ponto é exatamente o ápice de uma curva.
 */
export function buildTrackPath(points: TrackPoint[]): string {
  const [first, ...rest] = points;
  if (!first) return "";

  let d = `M${first.x} ${first.y}`;
  let previous = first;
  for (const point of rest) {
    const handle = (point.y - previous.y) / 2;
    d += ` C${previous.x} ${previous.y + handle} ${point.x} ${point.y - handle} ${point.x} ${point.y}`;
    previous = point;
  }
  return d;
}

/**
 * Liga os pontos com curvas suaves na horizontal (a pista do agendamento,
 * que corre da esquerda para a direita). A tangente é horizontal em cada
 * ponto, então cada ponto é o ápice de uma curva.
 */
export function buildLanePath(points: TrackPoint[]): string {
  const [first, ...rest] = points;
  if (!first) return "";

  let d = `M${first.x} ${first.y}`;
  let previous = first;
  for (const point of rest) {
    const handle = (point.x - previous.x) / 2;
    d += ` C${previous.x + handle} ${previous.y} ${point.x - handle} ${point.y} ${point.x} ${point.y}`;
    previous = point;
  }
  return d;
}

/**
 * Encontra, por busca binária, o comprimento do traçado em que a
 * coordenada `axis` vale `target`. Funciona em traçados que só avançam
 * nesse eixo (a pista da Trajetória desce; a do agendamento vai para a direita).
 */
export function lengthAt(
  path: SVGPathElement,
  axis: "x" | "y",
  target: number,
  totalLength = path.getTotalLength(),
): number {
  let low = 0;
  let high = totalLength;
  for (let i = 0; i < 14; i += 1) {
    const middle = (low + high) / 2;
    if (path.getPointAtLength(middle)[axis] < target) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

const toDegrees = (radians: number) => (radians * 180) / Math.PI;
const angleBetween = (a: DOMPoint, b: DOMPoint) => Math.atan2(b.y - a.y, b.x - a.x);

export type CarPose = {
  x: number;
  y: number;
  /** Quanto do traçado o carro já percorreu, em pixels. */
  length: number;
  totalLength: number;
  /** Rotação final do carro, em graus. */
  rotation: number;
  /** Intensidade do drift, de 0 (reta) a 1 (curva fechada). */
  driftForce: number;
  /** -1 ou 1: lado para onde a traseira escorrega. */
  driftDirection: number;
};

/** Calcula posição e atitude do carro na altura `targetY` da pista. */
export function getCarPose(path: SVGPathElement, targetY: number): CarPose {
  const totalLength = path.getTotalLength();
  return getCarPoseAtLength(path, lengthAt(path, "y", targetY, totalLength), totalLength);
}

/**
 * Calcula posição e atitude do carro a `length` pixels do início do traçado.
 * Em traçados fechados (`loop`), o carro dá a volta sem parar no fim.
 */
export function getCarPoseAtLength(
  path: SVGPathElement,
  length: number,
  totalLength = path.getTotalLength(),
  { loop = false }: { loop?: boolean } = {},
): CarPose {
  const at = (offset: number) => {
    const target = length + offset;
    if (loop) return path.getPointAtLength(((target % totalLength) + totalLength) % totalLength);
    return path.getPointAtLength(Math.min(totalLength, Math.max(0, target)));
  };

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
    length,
    totalLength,
    rotation: heading - 90 + driftAngle,
    driftForce,
    driftDirection,
  };
}

/**
 * Traçado em "8" (lemniscata de Gerono) centrado em (cx, cy), com meia
 * largura `rx` e meia altura `ry`. É o exercício clássico do drift: o
 * carro contorna dois cones alternando o lado.
 */
export function buildFigureEightPath(cx: number, cy: number, rx: number, ry: number): string {
  const steps = 160;
  let d = "";
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    const x = cx + rx * Math.sin(t);
    const y = cy + ry * Math.sin(t) * Math.cos(t) * 2;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return `${d}Z`;
}
