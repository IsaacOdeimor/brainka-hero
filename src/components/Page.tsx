import Nav from './Nav';
import HeroCopy from './HeroCopy';
import Orbit from './Orbit';
import AppTiles from './AppTiles';
import head from '../assets/head.png';

/**
 * The finished hero. It mounts fully visible (`static`); the rebuild
 * animation then hides every layer and has the agents bring them back.
 */
export default function Page({ still = false }: { still?: boolean }) {
  return (
    <div id="page" className="static" data-still={still || undefined}>
      <Nav />
      <main className="hero">
        <HeroCopy />
        <div className="visual" id="visual">
          <Orbit />
          <img className="L" id="head" src={head} alt="" />
          <AppTiles />
        </div>
      </main>
    </div>
  );
}
