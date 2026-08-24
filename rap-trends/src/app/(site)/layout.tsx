import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LiveBar } from "@/components/live-bar";
import { getNowAndNext, getRadioClock } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** Public network chrome: header, footer, and the persistent live controls. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ current, next }, radio] = await Promise.all([getNowAndNext(), getRadioClock()]);

  return (
    <div className="pb-20">
      <a href="#main" className="skip-link">Skip to main content</a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <LiveBar segments={radio} current={current} nextTitle={next[0]?.title} />
    </div>
  );
}
