import { CENAS } from "../../roteiro";
import type { SceneFactory } from "../director";
import type { Scene } from "../scene";
import { LobbyScene } from "./s00-lobby";
import { AberturaScene } from "./s01-abertura";
import { NscScene } from "./s02-nsc";
import { NetoScene } from "./s03-neto";
import { ProblemaScene } from "./s04-problema";
import { IdealizacaoScene } from "./s05-idealizacao";
import { CriacaoScene } from "./s06-criacao";
import { AgendarScene } from "./s07-agendar";
import { AcessibilidadeScene } from "./s08-acessibilidade";
import { ResultadoScene } from "./s09-resultado";
import { EncerramentoScene } from "./s10-encerramento";
import { PlaceholderScene } from "./placeholder";

/** Uma fábrica por cena, na ordem do roteiro (o id confere com roteiro.ts). */
const BY_ID: Record<string, () => Scene> = {
  "s00-lobby": () => new LobbyScene(),
  "s01-abertura": () => new AberturaScene(),
  "s06-criacao": () => new CriacaoScene(),
  "s10-encerramento": () => new EncerramentoScene(),
  "s02-nsc": () => new NscScene(),
  "s03-neto": () => new NetoScene(),
  "s04-problema": () => new ProblemaScene(),
  "s05-idealizacao": () => new IdealizacaoScene(),
  "s07-agendar": () => new AgendarScene(),
  "s08-acessibilidade": () => new AcessibilidadeScene(),
  "s09-resultado": () => new ResultadoScene(),
};

export const SCENES: SceneFactory[] = CENAS.map(
  (cena) => BY_ID[cena.id] ?? (() => new PlaceholderScene(cena)),
);
