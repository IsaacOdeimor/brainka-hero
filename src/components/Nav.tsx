import { useState } from 'react';
import { LogoMark } from './Logo';
import { Text } from './Text';
import { ArrowRight } from './icons';

export const NAV_LINKS = [
  { id: 'nav1', label: 'Product' },
  { id: 'nav2', label: 'Solutions' },
  { id: 'nav3', label: 'Resources' },
  { id: 'nav4', label: 'Pricing' },
] as const;

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <a className="brand" href="#" aria-label="Brainka home">
        <span className="L" id="logoMark"><LogoMark /></span>
        <Text id="logoText" text="Brainka" />
      </a>

      <nav className="links" aria-label="Main">
        {NAV_LINKS.map((l) => (
          <Text key={l.id} id={l.id} text={l.label} className="navlink" />
        ))}
      </nav>

      <div className="actions">
        <Text id="login" text="Log in" className="navlink" />
        <a className="L btn dark" id="gs" href="#">
          <Text id="gsText" text="Get Started" />
          <ArrowRight className="L" id="gsArrow" />
        </a>
        <button
          className={`menu${open ? ' open' : ''}`}
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span />
        </button>
      </div>

      {open && (
        <div className="mobile-menu">
          {NAV_LINKS.map((l) => <a key={l.id} href="#">{l.label}</a>)}
          <a href="#">Log in</a>
        </div>
      )}
    </header>
  );
}
