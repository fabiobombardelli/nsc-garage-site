import { describe, expect, it } from "vitest";
import { generateProtocol, isProtocolFormat, normalizeProtocol } from "./protocol";
import {
  formatPhone,
  isValidPhone,
  normalizePhone,
  validateCustomer,
  type CustomerFormValues,
} from "./validation";

/** TC-015: identificação do cliente, por partição de equivalência e valor-limite. */
const NOW = new Date(2026, 10, 9, 10, 0);

const valid: CustomerFormValues = {
  name: "Fábio",
  phone: "(11) 98765-4321",
  email: "",
  vehicleModel: "Nissan 350Z",
  vehicleYear: "",
  notes: "",
  consent: true,
};

describe("TC-015 Identificação do cliente (UC-20 Validar Dados)", () => {
  it("TC-015.1 todos os campos válidos → sem erros", () => {
    expect(validateCustomer(valid, NOW)).toEqual({});
  });

  it("TC-015.2 todos os campos obrigatórios vazios → um erro por campo", () => {
    const errors = validateCustomer(
      { ...valid, name: " ", phone: "", vehicleModel: "", consent: false },
      NOW,
    );
    expect(Object.keys(errors)).toEqual(["name", "phone", "vehicleModel", "consent"]);
  });

  it.each([
    ["celular com DDD", "11987654321", true],
    ["fixo com DDD", "1134567890", true],
    ["com DDI 55", normalizePhone("+55 11 98765-4321"), true],
    ["sem DDD", "987654321", false],
    ["DDD com zero", "01987654321", false],
    ["celular sem o 9", "11887654321", false],
    ["dígitos a mais", "119876543210", false],
  ])("TC-015.3 telefone %s → %s", (_label, phone, expected) => {
    expect(isValidPhone(phone)).toBe(expected);
  });

  it("TC-015.4 e-mail é opcional, mas se vier precisa de @ e domínio", () => {
    expect(validateCustomer({ ...valid, email: "nome@exemplo.com" }, NOW).email).toBeUndefined();
    expect(validateCustomer({ ...valid, email: "nome.exemplo.com" }, NOW).email).toBeDefined();
  });

  it("TC-015.5 ano do carro: quatro dígitos, de 1950 até o ano que vem (valor-limite)", () => {
    const year = (vehicleYear: string) => validateCustomer({ ...valid, vehicleYear }, NOW);
    expect(year("1950").vehicleYear).toBeUndefined();
    expect(year("1949").vehicleYear).toBeDefined();
    expect(year("2027").vehicleYear).toBeUndefined();
    expect(year("2028").vehicleYear).toBeDefined();
    expect(year("06").vehicleYear).toBeDefined();
  });

  it("formata o telefone para exibição", () => {
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
    expect(formatPhone("1134567890")).toBe("(11) 3456-7890");
  });
});

describe("TC-016 Protocolo (RN-07)", () => {
  it("TC-016.1 gera no formato NSC- + 6 caracteres sem 0, O, 1, I ou L", () => {
    for (let i = 0; i < 200; i += 1) {
      const protocol = generateProtocol();
      expect(isProtocolFormat(protocol)).toBe(true);
      expect(protocol.slice(4)).not.toMatch(/[01OIL]/);
    }
  });

  it("TC-016.2 aceita o protocolo digitado de vários jeitos", () => {
    expect(normalizeProtocol("nsc-k7q4m2")).toBe("NSC-K7Q4M2");
    expect(normalizeProtocol("K7Q4M2")).toBe("NSC-K7Q4M2");
    expect(normalizeProtocol(" NSC K7Q 4M2 ")).toBe("NSC-K7Q4M2");
    // Código que começa com "NSC" não perde as letras.
    expect(normalizeProtocol("NSCABC")).toBe("NSC-NSCABC");
  });
});
