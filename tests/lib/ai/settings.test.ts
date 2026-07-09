import { describe, expect, it } from "vitest";
import {
  clearAiSettings,
  hasConfiguredAiKey,
  loadAiSettings,
  saveAiSettings,
} from "@/lib/ai/settings";

describe("loadAiSettings", () => {
  it("retorna padrão quando não há configuração", () => {
    expect(loadAiSettings()).toEqual({
      provider: "openai",
      apiKey: "",
      rememberKey: false,
    });
  });
});

describe("saveAiSettings", () => {
  it("salva chave no localStorage quando rememberKey é true", () => {
    saveAiSettings({
      provider: "anthropic",
      apiKey: "sk-test",
      rememberKey: true,
    });

    expect(loadAiSettings()).toEqual({
      provider: "anthropic",
      apiKey: "sk-test",
      rememberKey: true,
    });
  });

  it("salva chave no sessionStorage quando rememberKey é false", () => {
    clearAiSettings();
    saveAiSettings({
      provider: "gemini",
      apiKey: "gemini-key",
      rememberKey: false,
    });

    expect(loadAiSettings().apiKey).toBe("gemini-key");
    expect(loadAiSettings().rememberKey).toBe(false);
  });

  it("mantém provider sem chave após salvar sem rememberKey", () => {
    clearAiSettings();
    saveAiSettings({
      provider: "openai",
      apiKey: "temp-key",
      rememberKey: false,
    });

    sessionStorage.clear();

    expect(loadAiSettings()).toEqual({
      provider: "openai",
      apiKey: "",
      rememberKey: false,
    });
  });
});

describe("hasConfiguredAiKey", () => {
  it("retorna true quando há chave", () => {
    expect(
      hasConfiguredAiKey({
        provider: "openai",
        apiKey: "sk-123",
        rememberKey: false,
      })
    ).toBe(true);
  });

  it("retorna false para chave vazia", () => {
    expect(
      hasConfiguredAiKey({
        provider: "openai",
        apiKey: "   ",
        rememberKey: false,
      })
    ).toBe(false);
  });
});
