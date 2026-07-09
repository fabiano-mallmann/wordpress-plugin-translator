import { describe, expect, it } from "vitest";
import { buildTranslationPrompt, parseTranslationResponse } from "@/lib/ai/prompt";

describe("buildTranslationPrompt", () => {
  it("inclui locale e strings no prompt", () => {
    const prompt = buildTranslationPrompt("pt_BR", [
      { msgid: "Save", msgctxt: "button" },
    ]);

    expect(prompt).toContain("Brazilian Portuguese");
    expect(prompt).toContain("pt_BR");
    expect(prompt).toContain("Save");
  });
});

describe("parseTranslationResponse", () => {
  it("faz parse de JSON válido", () => {
    const result = parseTranslationResponse(
      '{"translations":["Salvar","Cancelar"]}',
      2
    );

    expect(result).toEqual(["Salvar", "Cancelar"]);
  });

  it("extrai JSON de texto com conteúdo extra", () => {
    const result = parseTranslationResponse(
      'Here is the result:\n{"translations":["Olá"]}\nThanks',
      1
    );

    expect(result).toEqual(["Olá"]);
  });

  it("lança erro quando quantidade não confere", () => {
    expect(() =>
      parseTranslationResponse('{"translations":["A"]}', 2)
    ).toThrow("eram esperadas 2");
  });
});
