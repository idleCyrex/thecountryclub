import Footer from '@/components/Footer'
import RouteReveal from '@/components/RouteReveal'

/** Re-mounts on every navigation: page + footer, then lifts the curtain. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main id="main">{children}</main>
      <Footer />
      <RouteReveal />
    </>
  )
}
