import { videos as defaults, type YouTubeVideo } from "@/config/videos";

/**
 * Responsive grid of YouTube embeds. Plain HTML only — independent of the 3D
 * story. Content defaults to config/videos.ts; every prop can override it.
 */
type Props = {
  title?: string;
  subtitle?: string;
  videos?: YouTubeVideo[];
};

/** Any YouTube link → privacy-enhanced embed URL, or null if unrecognised. */
function toEmbedUrl(url: string): string | null {
  const m = url.trim().match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live)\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0` : null;
}

const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export function YouTubeVideos({ title = defaults.title, subtitle = defaults.subtitle, videos = defaults.items }: Props) {
  if (videos.length === 0) return null;
  return (
    <section aria-labelledby="videos-title" className="bg-mist py-20 sm:py-28">
      <div className={wrap}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="videos-title" className="font-display text-4xl font-medium text-ink sm:text-5xl">
            {title}
          </h2>
          {subtitle && <p className="mt-4 text-ink/70">{subtitle}</p>}
        </div>
        <span aria-hidden="true" className="mx-auto mt-5 block h-1 w-16 rounded-full" style={{ background: "linear-gradient(90deg, #2f2ee0, #5b5af0)" }} />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => {
            const src = toEmbedUrl(v.url);
            return (
              <li key={`${i}-${v.url}`} className={videos.length % 2 === 1 && i === videos.length - 1 ? "sm:col-span-2 lg:col-span-1" : undefined}>
                <figure className="flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_30px_60px_-45px_rgba(14,26,23,0.45)]">
                  <div className="relative aspect-video w-full bg-pond-950">
                    {src ? (
                      <iframe
                        src={src}
                        title={v.title}
                        loading="lazy"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">Video coming soon</div>
                    )}
                  </div>
                  <figcaption className="px-6 py-5 font-semibold text-ink">{v.title}</figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
