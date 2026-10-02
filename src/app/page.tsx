import { Navbar } from "@/components/ui/Navbar";
import { StoryExperience } from "@/components/sections/StoryExperience";
import { ProductOverview } from "@/components/sections/ProductOverview";
import { WhyRupa } from "@/components/sections/WhyRupa";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";

/**
 * HOMEPAGE
 * The 3D storytelling (Hero → Floating → Dive → Sinking → Polyculture → Brand)
 * lives entirely inside <StoryExperience/>. Everything after it is a normal,
 * lightweight page section — the pattern every other page will follow.
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <StoryExperience />
        <ProductOverview />
        <WhyRupa />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
