import Marquee from './ui/Marquee'

/** Page-transition curtain: dark panel with a yellow ticker riding its top edge (recipe i). */
export default function Curtain() {
  return (
    <div className="curtain" aria-hidden="true">
      <div className="curtain__edge">
        <Marquee text="BOOK YOUR VISIT NOW" duration={12} repeat={6} />
      </div>
      <p className="curtain__mark display">
        <span>COUNTRY</span> <span>CLUB</span>
      </p>
    </div>
  )
}
