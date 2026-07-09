import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExportPanel } from "@/components/export-panel";

const defaultProps = {
  slug: "my-plugin",
  locale: "pt_BR",
  textDomain: "my-plugin",
  entries: [{ msgid: "Hello", msgstr: "Olá" }],
  headers: { Language: "pt_BR" },
};

describe("ExportPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dispara download em exportação .po bem-sucedida", async () => {
    const user = userEvent.setup();
    const blob = new Blob(["po content"], { type: "text/plain" });
    const click = vi.fn();
    const createObjectURL = vi.fn().mockReturnValue("blob:mock");
    const revokeObjectURL = vi.fn();
    const originalCreateElement = document.createElement.bind(document);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => blob,
    }));
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });
    vi.spyOn(document, "createElement").mockImplementation((tagName, options) => {
      const element = originalCreateElement(tagName, options);
      if (tagName === "a") {
        element.click = click;
      }
      return element;
    });

    render(<ExportPanel {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Baixar \.po/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/export",
        expect.objectContaining({ method: "POST" })
      );
      expect(click).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");
    });
  });

  it("exibe erro da API", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Falha na exportação" }),
      })
    );

    render(<ExportPanel {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Baixar \.mo/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Falha na exportação");
  });

  it("exibe erro genérico em falha de rede", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    render(<ExportPanel {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Baixar \.po/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("network");
  });
});
