import { Certifications } from "./Certifications";
import { YouTubeVideos } from "./YouTubeVideos";
import { Testimonials } from "./Testimonials";

/**
 * The three closing sections shown at the end of every page (except Gallery),
 * directly above the footer, in this order: Certifications → YouTube videos →
 * Customer reviews. Render it once, as the last child of <main>.
 *

 * `background` should match the page's own background (the certificate strip
 * is transparent).
 */
export function PreFooterSections({ background = "bg-mist" }: { background?: string }) {
  return (
    <div className={background}>
      <Certifications />
      <YouTubeVideos />
      <Testimonials />
    </div>
  );
}
