export function LandscapePrompt() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        <div className="relative h-20 w-12 rounded-lg border-2 border-muted-foreground/40">
          <svg
            className="absolute inset-0 h-full w-full text-muted-foreground/60"
            viewBox="0 0 48 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            role="img"
            aria-label="Phone outline"
          >
            <title>Phone</title>
            <rect x="8" y="4" width="32" height="72" rx="4" />
            <circle cx="24" cy="68" r="3" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-muted-foreground/60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="Rotate arrow"
            >
              <title>Rotate</title>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Rotate Your Device
          </h2>
          <p className="text-sm text-muted-foreground max-w-[260px]">
            Mididea works best in landscape mode. Turn your phone sideways for
            the full sequencer experience.
          </p>
        </div>
      </div>
    </div>
  )
}
