import type { SchedulingRules } from "@/content/scheduling";
import { addDays, fromDateKey, toDateKey, weekday } from "../domain/calendar";
import { generateProtocol } from "../domain/protocol";
import { dayAvailability } from "../domain/rules";
import type { Appointment, AppointmentStatus, Rating, StatusChange } from "../domain/types";

/**
 * Agendamentos de exemplo para demonstrar o painel da oficina e a consulta
 * do cliente na apresentação. Só são criados quando alguém clica em
 * "Carregar exemplos" no painel, e todos os nomes levam "(exemplo)".
 */

type DemoSeed = {
  name: string;
  phone: string;
  serviceId: string;
  vehicle: string;
  year?: string;
  notes?: string;
  /** Status final e caminho até ele (sem contar o "pendente" inicial). */
  path: AppointmentStatus[];
  /** Dias a partir de hoje (negativo = passado). Futuros usam o próximo horário livre. */
  daysFromToday: number;
  rating?: Omit<Rating, "ratedAt">;
};

const SEEDS: DemoSeed[] = [
  {
    name: "Ana Souza (exemplo)",
    phone: "11900000001",
    serviceId: "manutencao",
    vehicle: "Toyota GR86",
    year: "2023",
    notes: "Revisão dos 20 mil km e barulho na suspensão dianteira.",
    path: [],
    daysFromToday: 1,
  },
  {
    name: "Bruno Lima (exemplo)",
    phone: "11900000002",
    serviceId: "drift",
    vehicle: "Nissan 350Z",
    year: "2006",
    notes: "Quer preparar o carro para a primeira etapa do campeonato.",
    path: ["confirmado"],
    daysFromToday: 2,
  },
  {
    name: "Carla Mendes (exemplo)",
    phone: "11900000003",
    serviceId: "suspensao",
    vehicle: "BMW 330i",
    path: [],
    daysFromToday: 3,
  },
  {
    name: "Diego Rocha (exemplo)",
    phone: "11900000004",
    serviceId: "motor",
    vehicle: "Subaru WRX",
    year: "2015",
    path: ["confirmado"],
    daysFromToday: 5,
  },
  {
    name: "Eduardo Alves (exemplo)",
    phone: "11900000005",
    serviceId: "telemetria",
    vehicle: "Mazda MX-5",
    path: ["cancelado"],
    daysFromToday: 4,
  },
  {
    name: "Fernanda Costa (exemplo)",
    phone: "11900000006",
    serviceId: "manutencao",
    vehicle: "Honda Civic Si",
    year: "2018",
    path: ["confirmado", "concluido"],
    daysFromToday: -3,
  },
  {
    name: "Gustavo Pereira (exemplo)",
    phone: "11900000007",
    serviceId: "usinagem",
    vehicle: "Ford Mustang GT",
    path: ["confirmado", "concluido"],
    daysFromToday: -10,
    rating: { score: 5, comment: "Avaliação de exemplo para a demonstração." },
  },
];

/** O próximo dia útil (com horário de funcionamento) a partir de `dateKey`, para trás ou para frente. */
function nearestOpenDay(dateKey: string, rules: SchedulingRules, step: 1 | -1): string {
  let day = dateKey;
  while (!rules.openingHours[weekday(day)]) day = addDays(day, step);
  return day;
}

export function buildDemoAppointments(
  existing: readonly Appointment[],
  now: Date,
  rules: SchedulingRules,
  random: () => number,
): Appointment[] {
  const created: Appointment[] = [];
  const protocols = new Set(existing.map((item) => item.protocol));
  const today = toDateKey(now);

  for (const seed of SEEDS) {
    const occupied = [...existing, ...created];
    let date: string;
    let time: string;

    if (seed.daysFromToday < 0) {
      // Atendimentos passados: dia útil anterior, às 10h.
      date = nearestOpenDay(addDays(today, seed.daysFromToday), rules, -1);
      time = "10:00";
    } else {
      // Futuros: o primeiro horário livre a partir do dia pedido.
      let day = addDays(today, seed.daysFromToday);
      let slot = dayAvailability(day, occupied, now, rules).slots.find((s) => s.state === "livre");
      for (let tries = 0; !slot && tries < rules.bookingWindowDays; tries += 1) {
        day = addDays(day, 1);
        slot = dayAvailability(day, occupied, now, rules).slots.find((s) => s.state === "livre");
      }
      if (!slot) continue;
      date = day;
      time = slot.time;
    }

    let protocol = generateProtocol(random);
    while (protocols.has(protocol)) protocol = generateProtocol(random);
    protocols.add(protocol);

    // Histórico coerente com a máquina de estados: pendente → … → status final.
    const createdAt = new Date(now.getTime() - (Math.abs(seed.daysFromToday) + 2) * 86_400_000);
    const history: StatusChange[] = [
      { from: null, to: "pendente", by: "cliente", at: createdAt.toISOString() },
    ];
    const finishedAt = fromDateKey(date, time).getTime() + 2 * 3_600_000;
    seed.path.forEach((to, index) => {
      // Concluído só depois do atendimento; as outras mudanças, logo após o pedido.
      const at = new Date(
        to === "concluido" ? finishedAt : createdAt.getTime() + (index + 1) * 3_600_000,
      ).toISOString();
      history.push({
        from: history[history.length - 1]?.to ?? "pendente",
        to,
        by: to === "cancelado" ? "cliente" : "oficina",
        at,
      });
    });
    const last = history[history.length - 1];

    created.push({
      protocol,
      serviceId: seed.serviceId,
      date,
      time,
      customer: { name: seed.name, phone: seed.phone },
      vehicle: { model: seed.vehicle, ...(seed.year ? { year: seed.year } : {}) },
      ...(seed.notes ? { notes: seed.notes } : {}),
      status: last?.to ?? "pendente",
      history,
      ...(seed.rating ? { rating: { ...seed.rating, ratedAt: now.toISOString() } } : {}),
      createdAt: createdAt.toISOString(),
      updatedAt: last?.at ?? createdAt.toISOString(),
    });
  }

  return created;
}
