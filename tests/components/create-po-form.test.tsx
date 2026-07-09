import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreatePoForm } from "@/components/create-po-form";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/i18n/upload-session", () => ({
  saveBlankSession: vi.fn(),
}));

import { saveBlankSession } from "@/lib/i18n/upload-session";

describe("CreatePoForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("mantém submit desabilitado sem text domain", () => {
    render(<CreatePoForm />);
    expect(
      screen.getByRole("button", { name: /Criar tradução do zero/i })
    ).toBeDisabled();
  });

  it("exibe erro para domain inválido", async () => {
    const user = userEvent.setup();
    render(<CreatePoForm />);

    await user.type(screen.getByLabelText(/Text domain/i), "Invalid_Domain");
    await user.click(screen.getByRole("button", { name: /Criar tradução do zero/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("text domain válido");
    expect(saveBlankSession).not.toHaveBeenCalled();
  });

  it("salva sessão e redireciona com domain válido", async () => {
    const user = userEvent.setup();
    render(<CreatePoForm />);

    await user.type(screen.getByLabelText(/Text domain/i), "my-plugin");
    await user.click(screen.getByRole("button", { name: /Criar tradução do zero/i }));

    await waitFor(() => {
      expect(saveBlankSession).toHaveBeenCalled();
      expect(push).toHaveBeenCalledWith("/editor/new");
    });
  });
});
