import slack from '../assets/icons/slack.png';
import notion from '../assets/icons/notion.png';
import gmail from '../assets/icons/gmail.png';
import figma from '../assets/icons/figma.png';
import gcal from '../assets/icons/gcal.png';
import github from '../assets/icons/github.png';
import dropbox from '../assets/icons/dropbox.png';

/** Tile positions in the visual's 690×798 coordinate space. */
export const TILES = [
  { name: 'slack', x: 151, y: 48, src: slack },
  { name: 'notion', x: 305, y: 8, src: notion },
  { name: 'gmail', x: 472, y: 44, src: gmail },
  { name: 'figma', x: 97, y: 148, src: figma },
  { name: 'gcal', x: 245, y: 145, src: gcal },
  { name: 'github', x: 382, y: 130, src: github },
  { name: 'dropbox', x: 517, y: 154, src: dropbox },
] as const;

export type TileName = (typeof TILES)[number]['name'];

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export default function AppTiles() {
  return (
    <>
      {TILES.map((t) => (
        <div key={t.name} id={`t-${t.name}`} className="L tile" style={{ left: pct(t.x, 690), top: pct(t.y, 798) }}>
          {/* during the build every tile starts as a Slack copy, then gets swapped */}
          {t.name !== 'slack' && <img className="g tmp" src={slack} alt="" />}
          <img className="g L" src={t.src} alt={t.name} />
        </div>
      ))}
    </>
  );
}
