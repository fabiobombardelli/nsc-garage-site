import "@fontsource-variable/archivo/wdth.css";
import "./styles/tokens.css";

/**
 * Uma página, duas rotas:
 * - "#/apresentador?sala=XXXX": o celular de cada integrante;
 * - qualquer outra: a tela do projetor.
 * Cada lado é baixado sob demanda (o celular não baixa o three.js).
 */
const app = document.getElementById("app");
if (app) {
  if (location.hash.startsWith("#/apresentador")) {
    void import("./presenter/presenter").then(({ startPresenter }) => startPresenter(app));
  } else {
    void import("./screen/screen").then(({ startScreen }) => startScreen(app));
  }
}
