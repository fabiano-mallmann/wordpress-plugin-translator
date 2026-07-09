import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UrlInput } from "@/components/url-input";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("UrlInput", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("mantém botão desabilitado para input inválido", () => {
    render(<UrlInput />);
    expect(screen.getByRole("button", { name: /Buscar/i })).toBeDisabled();
  });

  it("exibe erro para input inválido ao submeter formulário", async () => {
    const user = userEvent.setup();
    const { container } = render(<UrlInput />);

    await user.type(screen.getByLabelText(/URL ou slug/i), "invalid slug!");
    fireEvent.submit(container.querySelector("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent("URL válida");
  });

  it("redireciona após busca bem-sucedida", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ slug: "contact-form-7", name: "CF7" }),
      })
    );

    render(<UrlInput defaultValue="contact-form-7" />);
    await user.click(screen.getByRole("button", { name: /Buscar/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/plugin/contact-form-7");
    });
  });

  it("exibe erro 404 da API", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Plugin não encontrado." }),
      })
    );

    render(<UrlInput defaultValue="missing-plugin" />);
    await user.click(screen.getByRole("button", { name: /Buscar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Plugin não encontrado.");
  });
});
