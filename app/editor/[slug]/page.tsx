import { Suspense } from "react";
import { EditorPageContent } from "./editor-page-content";

function EditorLoading() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-muted" />
        <div className="h-64 rounded-lg bg-muted" />
      </div>
    </main>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorLoading />}>
      <EditorPageContent />
    </Suspense>
  );
}
