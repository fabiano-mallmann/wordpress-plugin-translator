import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InstallSteps } from "@/components/tutorial/install-steps";

interface TutorialPanelProps {
  textDomain?: string;
  locale?: string;
  slug?: string;
}

export function TutorialPanel({
  textDomain = "meu-plugin",
  locale = "pt_BR",
  slug = "meu-plugin",
}: TutorialPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Como instalar no WordPress</CardTitle>
        <CardDescription>
          Siga estes passos após exportar seus arquivos de tradução.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InstallSteps textDomain={textDomain} locale={locale} slug={slug} />
      </CardContent>
    </Card>
  );
}
