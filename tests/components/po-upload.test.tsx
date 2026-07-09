import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PoUpload } from "@/components/po-upload";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/i18n/upload-session", () => ({
  saveUploadSession: vi.fn(),
}));

import { saveUploadSession } from "@/lib/i18n/upload-session";

describe("PoUpload", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("rejeita extensão inválida no client", async () => {
    const user = userEvent.setup();
    render(<PoUpload />);

    const input = document.getElementById("po-upload-input") as HTMLInputElement;
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    await user.upload(input, file);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Apenas arquivos .po são aceitos."
    );
    expect(saveUploadSession).not.toHaveBeenCalled();
  });

  it("salva sessão e redireciona após upload válido", async () => {
    const user = userEvent.setup();
    const poContent = `msgid ""
msgstr ""
"Language: pt_BR\\n"

msgid "Hello"
msgstr "Olá"
`;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          slug: "my-plugin",
          locale: "pt_BR",
          textDomain: "my-plugin",
          source: "upload",
          entries: [{ msgid: "Hello", msgstr: "Olá" }],
          headers: {},
        }),
      })
    );

    render(<PoUpload />);
    const input = document.getElementById("po-upload-input") as HTMLInputElement;
    const file = new File([poContent], "my-plugin-pt_BR.po", { type: "text/plain" });
    await user.upload(input, file);

    await waitFor(() => {
      expect(saveUploadSession).toHaveBeenCalled();
      expect(push).toHaveBeenCalledWith("/editor/upload");
    });
  });

  it("exibe erro da API", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Arquivo inválido" }),
      })
    );

    render(<PoUpload />);
    const input = document.getElementById("po-upload-input") as HTMLInputElement;
    const file = new File(["bad"], "test.po", { type: "text/plain" });
    await user.upload(input, file);

    expect(await screen.findByRole("alert")).toHaveTextContent("Arquivo inválido");
  });
});
