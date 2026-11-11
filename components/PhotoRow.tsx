import MediaFill from './ui/MediaFill'
import Reveal from './Reveal'

/** Row of centred photo cells; odd cells sit lower for rhythm. */
export default function PhotoRow({ keys, tall }: { keys: string[]; tall?: boolean }) {
  return (
    <Reveal as="ul" className={`photo-row ${tall ? 'photo-row--tall' : ''}`}>
      {keys.map((k) => (
        <li key={k} className="photo-row__cell" data-r="">
          <MediaFill k={k} w={800} sizes="(max-width: 743px) 50vw, 25vw" />
        </li>
      ))}
    </Reveal>
  )
}
