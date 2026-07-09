import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TranslationProgress } from "@/components/translation-progress";

describe("TranslationProgress", () => {
  it("exibe contagem e porcentagem corretas", () => {
    render(<TranslationProgress total={5} translated={3} />);

    expect(screen.getByText("3 de 5 strings traduzidas")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("exibe 0% quando total é zero", () => {
    render(<TranslationProgress total={0} translated={0} />);

    expect(screen.getByText("0 de 0 strings traduzidas")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
