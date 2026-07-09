import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LocaleSelector } from "@/components/locale-selector";
import type { LocaleInfo } from "@/types/wordpress";

describe("LocaleSelector", () => {
  it("renderiza locale selecionado e texto de tradução oficial", () => {
    const locales: LocaleInfo[] = [
      {
        code: "pt_BR",
        englishName: "Portuguese",
        nativeName: "Português do Brasil",
        hasTranslation: true,
      },
      {
        code: "en_US",
        englishName: "English",
        nativeName: "English (US)",
        hasTranslation: false,
      },
    ];

    render(
      <LocaleSelector locales={locales} value="pt_BR" onChange={vi.fn()} />
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("pt_BR");
    expect(
      screen.getByText("Tradução oficial disponível no WordPress.org")
    ).toBeInTheDocument();
  });

  it("usa FALLBACK_LOCALES quando lista está vazia", async () => {
    const user = userEvent.setup();
    render(<LocaleSelector locales={[]} value="pt_BR" onChange={vi.fn()} />);

    expect(screen.getByRole("combobox")).toHaveTextContent("pt_BR");
    expect(
      screen.getByText(/Será usado o template/)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByText(/Português do Brasil \(pt_BR\)/)).toBeInTheDocument();
    expect(screen.getByText(/English \(US\) \(en_US\)/)).toBeInTheDocument();
  });

  it("exibe indicador de tradução oficial nas opções", async () => {
    const user = userEvent.setup();
    const locales: LocaleInfo[] = [
      {
        code: "pt_BR",
        englishName: "Portuguese",
        nativeName: "Português",
        hasTranslation: true,
      },
    ];

    render(
      <LocaleSelector locales={locales} value="pt_BR" onChange={vi.fn()} />
    );

    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByText(/Português \(pt_BR\) ✓/)).toBeInTheDocument();
  });
});
