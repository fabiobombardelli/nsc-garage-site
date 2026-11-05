import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FieldError } from "@/components/forms/Field";
import { schedulingRules } from "@/content/scheduling";
import { schedulingService } from "../..";
import {
  addDays,
  formatDayNumber,
  formatLongDate,
  formatTime,
  formatWeekRange,
  formatWeekdayShort,
  startOfWeek,
  toDateKey,
} from "../../domain/calendar";
import type { Day, Slot } from "../../domain/types";
import { useAgenda } from "../../hooks/useAgenda";
import { StepHeading, StepNav } from "./StepParts";

type DateTimeStepProps = {
  date: string | null;
  time: string | null;
  onChange: (choice: { date: string | null; time: string | null }) => void;
  onNext: () => void;
  onBack: () => void;
  focusOnMount: boolean;
};

type Errors = { day?: string; time?: string };

/** Texto curto da situação do dia, mostrado no próprio botão do dia. */
function dayStateText(day: Day, today: string): string {
  switch (day.state) {
    case "aberto": {
      const free = day.slots.filter((slot) => slot.state === "livre").length;
      return free === 1 ? "1 livre" : `${free} livres`;
    }
    case "fechado":
      return "Fechado";
    case "lotado":
      return "Lotado";
    case "indisponivel":
      return day.date < today ? "Encerrado" : "Indisponível";
  }
}

const SLOT_STATE_TEXT: Record<Slot["state"], string> = {
  livre: "",
  ocupado: "Ocupado",
  encerrado: "Encerrado",
};

/**
 * Etapa 2: dia e horário (RF-013 e RF-014).
 *
 * A semana aparece em sete botões de opção; dias fechados, lotados ou
 * passados ficam desativados e dizem o motivo em texto. Os horários do dia
 * escolhido vêm em seguida. A agenda se atualiza sozinha: se outra pessoa
 * (ou outra aba) ocupar o horário escolhido, ele é desmarcado e um aviso
 * é anunciado.
 */
export function DateTimeStep({
  date,
  time,
  onChange,
  onNext,
  onBack,
  focusOnMount,
}: DateTimeStepProps) {
  const today = toDateKey(new Date());
  const firstWeek = startOfWeek(today);
  const lastWeek = startOfWeek(addDays(today, schedulingRules.bookingWindowDays));
  const [weekStart, setWeekStart] = useState(() => (date ? startOfWeek(date) : firstWeek));
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState("");
  const autoAdvanced = useRef(false);
  const dayList = useRef<HTMLUListElement>(null);
  const slotList = useRef<HTMLUListElement>(null);

  const { data: week, error: loadError } = useAgenda(
    () => schedulingService.getWeek(weekStart),
    weekStart,
  );
  // O dia escolhido é carregado à parte: continua valendo se a pessoa folhear outras semanas.
  const { data: loadedDay } = useAgenda(
    () => (date ? schedulingService.getDay(date) : Promise.resolve(undefined)),
    `dia:${date ?? ""}`,
  );
  const selectedDay = loadedDay?.date === date ? loadedDay : undefined;

  // Semana sem nenhum dia aberto (sábado à tarde, por exemplo): pula para a próxima, uma vez.
  useEffect(() => {
    if (!week || date || autoAdvanced.current) return;
    autoAdvanced.current = true;
    if (!week.some((day) => day.state === "aberto") && weekStart < lastWeek) {
      setWeekStart(addDays(weekStart, 7));
    }
  }, [week, date, weekStart, lastWeek]);

  // O horário escolhido foi ocupado enquanto a pessoa olhava (RF-014).
  useEffect(() => {
    if (!selectedDay || !time) return;
    const slot = selectedDay.slots.find((item) => item.time === time);
    if (slot && slot.state !== "livre") {
      onChange({ date, time: null });
      setNotice(`O horário das ${formatTime(time)} acabou de ser ocupado. Escolha outro horário.`);
    }
  }, [selectedDay, time, date, onChange]);

  const focusFirstEnabled = (list: HTMLUListElement | null) =>
    list?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!date || !selectedDay) {
      setErrors({ day: "Escolha um dia para continuar." });
      focusFirstEnabled(dayList.current);
      return;
    }
    if (!time) {
      setErrors({ time: "Escolha um horário para continuar." });
      focusFirstEnabled(slotList.current);
      return;
    }
    onNext();
  };

  const chooseDay = (day: Day) => {
    const stillFree = day.slots.some((slot) => slot.time === time && slot.state === "livre");
    onChange({ date: day.date, time: stillFree ? time : null });
    setErrors({});
    setNotice("");
  };

  return (
    <form className="booking-form" noValidate onSubmit={handleSubmit}>
      <StepHeading step={1} focusOnMount={focusOnMount}>
        Quando você traz o carro?
      </StepHeading>
      <p className="step-help">
        A oficina atende de segunda a sábado. Cada horário reserva {schedulingRules.slotMinutes}{" "}
        minutos para a avaliação.
      </p>

      <fieldset className="choice-fieldset">
        <legend className="choice-legend">Dia</legend>
        <div className="week-nav">
          <button
            type="button"
            className="icon-button week-nav-button"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            disabled={weekStart <= firstWeek}
            aria-label="Semana anterior"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <p className="week-nav-label" aria-live="polite">
            <span className="sr-only-text">Semana de </span>
            {formatWeekRange(weekStart)}
          </p>
          <button
            type="button"
            className="icon-button week-nav-button"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            disabled={weekStart >= lastWeek}
            aria-label="Próxima semana"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
        {errors.day && <FieldError id="dia-erro">{errors.day}</FieldError>}
        {loadError && <FieldError>{loadError}</FieldError>}

        <ul ref={dayList} className="day-choices" aria-busy={!week || undefined}>
          {(week ?? []).map((day) => (
            <li key={day.date}>
              <label className="choice choice-day" data-state={day.state}>
                <input
                  type="radio"
                  name="dia"
                  value={day.date}
                  checked={date === day.date}
                  disabled={day.state !== "aberto"}
                  aria-describedby={errors.day ? "dia-erro" : undefined}
                  onChange={() => chooseDay(day)}
                />
                <span className="choice-day-weekday" aria-hidden="true">
                  {formatWeekdayShort(day.date)}
                </span>
                <span className="choice-day-number" aria-hidden="true">
                  {formatDayNumber(day.date)}
                </span>
                <span className="sr-only-text">{formatLongDate(day.date)}, </span>
                <span className="choice-day-state">{dayStateText(day, today)}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="choice-fieldset">
        <legend className="choice-legend">
          Horário{date && <span className="choice-legend-detail"> · {formatLongDate(date)}</span>}
        </legend>
        {errors.time && <FieldError id="horario-erro">{errors.time}</FieldError>}
        {selectedDay ? (
          <ul ref={slotList} className="slot-choices">
            {selectedDay.slots.map((slot) => (
              <li key={slot.time}>
                <label className="choice choice-slot" data-state={slot.state}>
                  <input
                    type="radio"
                    name="horario"
                    value={slot.time}
                    checked={time === slot.time}
                    disabled={slot.state !== "livre"}
                    aria-describedby={errors.time ? "horario-erro" : undefined}
                    onChange={() => {
                      onChange({ date, time: slot.time });
                      setErrors({});
                      setNotice("");
                    }}
                  />
                  <span className="choice-slot-time">{formatTime(slot.time)}</span>
                  {slot.state !== "livre" && (
                    <span className="choice-slot-state">{SLOT_STATE_TEXT[slot.state]}</span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="step-help">Escolha um dia para ver os horários.</p>
        )}
      </fieldset>

      <p className="step-notice" role="status">
        {notice}
      </p>

      <StepNav onBack={onBack} />
    </form>
  );
}
