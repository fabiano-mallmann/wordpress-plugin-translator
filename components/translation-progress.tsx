import { Progress } from "@/components/ui/progress";

interface TranslationProgressProps {
  total: number;
  translated: number;
}

export function TranslationProgress({ total, translated }: TranslationProgressProps) {
  const percentage = total === 0 ? 0 : Math.round((translated / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {translated} de {total} strings traduzidas
        </span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
