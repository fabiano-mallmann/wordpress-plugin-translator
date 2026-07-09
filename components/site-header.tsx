import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
            WP
          </span>
          <span>WordPress Translate</span>
        </Link>
        <nav className="text-sm text-muted-foreground">
          <Link href="/#tutorial" className="hover:text-foreground transition-colors">
            Tutorial
          </Link>
        </nav>
      </div>
    </header>
  );
}
