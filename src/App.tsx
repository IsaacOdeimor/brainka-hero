import { useRef } from 'react';
import Page from './components/Page';
import { LogoMark } from './components/Logo';
import { useRebuild } from './animation/useRebuild';

export default function App() {
  const frameRef = useRef<HTMLDivElement>(null);
  const { runId, animate } = useRebuild(frameRef);

  return (
    <>
      <div id="frame" ref={frameRef}>
        {/* placeholders drawn by the agents sit under the page */}
        <div id="under" />
        {/* the hero itself; remounted on every replay */}
        <Page key={runId} still={!animate} />
        {/* intro tile the agents gather around */}
        <div id="btile">
          <LogoMark size={32} />
        </div>
        {/* cursors, selection boxes, guides */}
        <div id="overlay" />
        <div className="ruler" id="rt" />
        <div className="ruler" id="rl" />
      </div>
      <div id="hint">
        press <kbd>R</kbd> to replay · <kbd>1</kbd> <kbd>2</kbd> <kbd>0</kbd> for 1× / 2× / 0.5×
      </div>
    </>
  );
}
