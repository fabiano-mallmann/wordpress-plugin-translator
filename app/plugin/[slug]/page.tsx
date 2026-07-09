import { Suspense } from "react";
import { PluginPageContent } from "./plugin-page-content";

function PluginLoading() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-32 rounded-lg bg-muted" />
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted w-1/3" />
      </div>
    </main>
  );
}

export default function PluginPage() {
  return (
    <Suspense fallback={<PluginLoading />}>
      <PluginPageContent />
    </Suspense>
  );
}
