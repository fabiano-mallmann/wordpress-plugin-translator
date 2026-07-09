import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { loadDraft, TranslationEditor } from "@/components/translation-editor";
import type { TranslationEntry } from "@/types/wordpress";

const initialEntries: TranslationEntry[] = [
  { msgid: "Hello", msgstr: "Olá" },
  { msgid: "Goodbye", msgstr: "" },
  { msgid: "Thanks", msgstr: "Obrigado" },
];

describe("loadDraft", () => {
  it("faz round-trip no localStorage", () => {
    const entries = [{ msgid: "Test", msgstr: "Teste" }];
    localStorage.setItem(
      "wp-translate-draft:my-plugin:pt_BR",
      JSON.stringify(entries)
    );
    expect(loadDraft("my-plugin", "pt_BR")).toEqual(entries);
  });

  it("retorna null no SSR", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error simulating SSR
    delete globalThis.window;
    expect(loadDraft("x", "pt_BR")).toBeNull();
    globalThis.window = originalWindow;
  });

  it("retorna null para JSON corrompido", () => {
    localStorage.setItem("wp-translate-draft:x:pt_BR", "{bad");
    expect(loadDraft("x", "pt_BR")).toBeNull();
  });
});

describe("TranslationEditor", () => {
  it("renderiza entradas iniciais", () => {
    const onChange = vi.fn();
    render(
      <TranslationEditor
        slug="plugin"
        locale="pt_BR"
        initialEntries={initialEntries}
        onChange={onChange}
      />
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Goodbye")).toBeInTheDocument();
  });

  it("usa draft em createMode quando existe", () => {
    const draft = [{ msgid: "Draft", msgstr: "Rascunho" }];
    localStorage.setItem(
      "wp-translate-draft:new:pt_BR",
      JSON.stringify(draft)
    );

    render(
      <TranslationEditor
        slug="new"
        locale="pt_BR"
        initialEntries={[]}
        onChange={vi.fn()}
        createMode
      />
    );

    expect(screen.getByDisplayValue("Draft")).toBeInTheDocument();
  });

  it("usa draft em modo normal quando length coincide", () => {
    const draft = [
      { msgid: "Hello", msgstr: "Draft Olá" },
      { msgid: "Goodbye", msgstr: "" },
      { msgid: "Thanks", msgstr: "Obrigado" },
    ];
    localStorage.setItem(
      "wp-translate-draft:plugin:pt_BR",
      JSON.stringify(draft)
    );

    render(
      <TranslationEditor
        slug="plugin"
        locale="pt_BR"
        initialEntries={initialEntries}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue("Draft Olá")).toBeInTheDocument();
  });

  it("ignora draft quando length difere em modo normal", () => {
    localStorage.setItem(
      "wp-translate-draft:plugin:pt_BR",
      JSON.stringify([{ msgid: "Only one", msgstr: "x" }])
    );

    render(
      <TranslationEditor
        slug="plugin"
        locale="pt_BR"
        initialEntries={initialEntries}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.queryByText("Only one")).not.toBeInTheDocument();
  });

  it("dispara onChange ao editar msgstr", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TranslationEditor
        slug="plugin"
        locale="pt_BR"
        initialEntries={initialEntries}
        onChange={onChange}
      />
    );

    const textareas = screen.getAllByPlaceholderText("Digite a tradução...");
    await user.clear(textareas[1]);
    await user.type(textareas[1], "Tchau");

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls.at(-1)?.[0] as TranslationEntry[];
    expect(lastCall[1].msgstr).toContain("Tchau");
  });

  it("permite adicionar e remover strings em createMode", async () => {
    const user = userEvent.setup();
    render(
      <TranslationEditor
        slug="new"
        locale="pt_BR"
        initialEntries={[]}
        onChange={vi.fn()}
        createMode
      />
    );

    await user.click(screen.getByRole("button", { name: /Adicionar string/i }));
    expect(screen.getByPlaceholderText("Texto original em inglês...")).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("Texto original em inglês..."),
      "New string"
    );
    await user.click(screen.getByRole("button", { name: "Remover string" }));
    expect(screen.queryByDisplayValue("New string")).not.toBeInTheDocument();
  });

  it("filtra por busca case-insensitive", async () => {
    const user = userEvent.setup();
    render(
      <TranslationEditor
        slug="plugin"
        locale="pt_BR"
        initialEntries={initialEntries}
        onChange={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("Buscar strings..."), "hello");
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.queryByText("Thanks")).not.toBeInTheDocument();
  });

  it("exibe mensagem quando filtros não retornam resultados", async () => {
    const user = userEvent.setup();
    render(
      <TranslationEditor
        slug="plugin"
        locale="pt_BR"
        initialEntries={initialEntries}
        onChange={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("Buscar strings..."), "zzzznotfound");
    expect(
      screen.getByText("Nenhuma string encontrada com os filtros atuais.")
    ).toBeInTheDocument();
  });

  it("exibe mensagem vazia em createMode sem entries", () => {
    render(
      <TranslationEditor
        slug="new"
        locale="pt_BR"
        initialEntries={[]}
        onChange={vi.fn()}
        createMode
      />
    );

    expect(
      screen.getByText(/Nenhuma string ainda/)
    ).toBeInTheDocument();
  });
});
