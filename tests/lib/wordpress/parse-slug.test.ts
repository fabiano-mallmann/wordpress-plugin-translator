import { describe, expect, it } from "vitest";
import { isValidPluginInput, parsePluginSlug } from "@/lib/wordpress/parse-slug";

describe("parsePluginSlug", () => {
  it("aceita slug direto em lowercase", () => {
    expect(parsePluginSlug("contact-form-7")).toBe("contact-form-7");
    expect(parsePluginSlug("my-plugin")).toBe("my-plugin");
  });

  it("rejeita slug com maiúsculas", () => {
    expect(parsePluginSlug("Contact-Form-7")).toBeNull();
  });

  it("extrai slug de URL completa", () => {
    expect(
      parsePluginSlug("https://wordpress.org/plugins/contact-form-7/")
    ).toBe("contact-form-7");
  });

  it("aceita URL sem protocolo", () => {
    expect(parsePluginSlug("wordpress.org/plugins/my-plugin/")).toBe("my-plugin");
  });

  it("aceita URL com www", () => {
    expect(
      parsePluginSlug("https://www.wordpress.org/plugins/my-plugin/")
    ).toBe("my-plugin");
  });

  it("retorna null para string vazia ou só espaços", () => {
    expect(parsePluginSlug("")).toBeNull();
    expect(parsePluginSlug("   ")).toBeNull();
  });

  it("retorna null para caracteres inválidos no slug", () => {
    expect(parsePluginSlug("my_plugin")).toBeNull();
    expect(parsePluginSlug("my plugin")).toBeNull();
  });

  it("retorna null para domínio incorreto", () => {
    expect(parsePluginSlug("https://google.com/plugins/my-plugin/")).toBeNull();
  });
});

describe("isValidPluginInput", () => {
  it("retorna true quando parsePluginSlug encontra slug", () => {
    expect(isValidPluginInput("contact-form-7")).toBe(true);
    expect(
      isValidPluginInput("https://wordpress.org/plugins/contact-form-7/")
    ).toBe(true);
  });

  it("retorna false para input inválido", () => {
    expect(isValidPluginInput("")).toBe(false);
    expect(isValidPluginInput("invalid_slug")).toBe(false);
  });
});
