import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { UrlInput } from "@/components/url-input";
import { PoUpload } from "@/components/po-upload";
import { TutorialPanel } from "@/components/tutorial/tutorial-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    step: "1",
    title: "Buscar ou enviar",
    description: "Use a URL do plugin na loja ou envie um arquivo .po",
  },
  {
    step: "2",
    title: "Editar",
    description: "Revise e ajuste as traduções no editor visual",
  },
  {
    step: "3",
    title: "Instalar",
    description: "Exporte .po/.mo e siga o tutorial de instalação",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Traduza plugins WordPress em minutos
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Cole a URL de um plugin da loja oficial, envie um arquivo .po existente,
            edite as traduções e exporte arquivos prontos para instalar no seu site.
          </p>
        </section>

        <section className="mt-10">
          <UrlInput size="large" />
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Exemplo:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">
              https://wordpress.org/plugins/contact-form-7/
            </code>
          </p>
        </section>

        <section className="mt-10">
          <div className="relative flex items-center py-2">
            <div className="grow border-t" />
            <span className="mx-4 shrink text-sm text-muted-foreground">ou</span>
            <div className="grow border-t" />
          </div>
          <h2 className="mt-4 text-center text-lg font-semibold">
            Enviar arquivo .po para editar
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Já possui um arquivo de tradução? Envie-o diretamente para o editor.
          </p>
          <div className="mt-6">
            <PoUpload size="large" />
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {steps.map((item) => (
            <Card key={item.step}>
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>

        <section id="tutorial" className="mt-16">
          <TutorialPanel />
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Ferramenta para tradução de plugins do{" "}
          <Link
            href="https://wordpress.org/plugins/"
            className="underline hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            WordPress.org
          </Link>
        </p>
        <p className="mt-2">
          Developed by{" "}
          <Link
            href="https://x.com/fabs_dev"
            className="underline hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            @fabs_dev
          </Link>
        </p>
      </footer>
    </>
  );
}
