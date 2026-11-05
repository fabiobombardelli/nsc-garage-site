/**
 * Datas da agenda. Os dias são guardados como texto "AAAA-MM-DD" e os
 * horários como "HH:MM", sempre no horário local da oficina. Assim um
 * agendamento das 9h continua sendo das 9h, sem conversões de fuso.
 */

const pad = (value: number) => String(value).padStart(2, "0");

/** Converte uma data em chave de dia ("AAAA-MM-DD"), no horário local. */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Converte uma chave de dia (e, opcionalmente, um horário "HH:MM") em data local. */
export function fromDateKey(dateKey: string, time = "00:00"): Date {
  const [year = 0, month = 1, day = 1] = dateKey.split("-").map(Number);
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

/** Soma dias a uma chave de dia (aceita valores negativos). */
export function addDays(dateKey: string, days: number): string {
  const date = fromDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** Dia da semana de uma chave de dia: 0 = domingo … 6 = sábado. */
export function weekday(dateKey: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return fromDateKey(dateKey).getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/** Segunda-feira da semana de um dia (a semana da agenda começa na segunda). */
export function startOfWeek(dateKey: string): string {
  const offset = (weekday(dateKey) + 6) % 7;
  return addDays(dateKey, -offset);
}

/** Converte "HH:MM" em minutos desde a meia-noite. */
export function toMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Converte minutos desde a meia-noite em "HH:MM". */
export function fromMinutes(totalMinutes: number): string {
  return `${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`;
}

/** Diferença em horas entre um momento e o início de um horário da agenda. */
export function hoursUntil(dateKey: string, time: string, now: Date): number {
  return (fromDateKey(dateKey, time).getTime() - now.getTime()) / 3_600_000;
}

/* ---------- Textos em português ---------- */

const longDate = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const weekdayShort = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const monthLong = new Intl.DateTimeFormat("pt-BR", { month: "long" });

/** "terça-feira, 10 de novembro" */
export function formatLongDate(dateKey: string): string {
  return longDate.format(fromDateKey(dateKey));
}

/** "Terça-feira, 10 de novembro" (para começo de frase e títulos). */
export function formatLongDateTitle(dateKey: string): string {
  const text = formatLongDate(dateKey);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "ter" (sem o ponto final que o Intl coloca em alguns navegadores). */
export function formatWeekdayShort(dateKey: string): string {
  return weekdayShort.format(fromDateKey(dateKey)).replace(".", "");
}

/** "novembro" */
export function formatMonth(dateKey: string): string {
  return monthLong.format(fromDateKey(dateKey));
}

/** "10" */
export function formatDayNumber(dateKey: string): string {
  return String(fromDateKey(dateKey).getDate());
}

/** "09:00" → "9h"; "09:30" → "9h30" (como se fala na oficina). */
export function formatTime(time: string): string {
  const [hours = "0", minutes = "00"] = time.split(":");
  return `${Number(hours)}h${minutes === "00" ? "" : minutes}`;
}

/** "9 a 15 de novembro" ou "30 de novembro a 6 de dezembro" (semana da agenda). */
export function formatWeekRange(weekStart: string): string {
  const end = addDays(weekStart, 6);
  const startDay = formatDayNumber(weekStart);
  const endText = `${formatDayNumber(end)} de ${formatMonth(end)}`;
  return formatMonth(weekStart) === formatMonth(end)
    ? `${startDay} a ${endText}`
    : `${startDay} de ${formatMonth(weekStart)} a ${endText}`;
}
