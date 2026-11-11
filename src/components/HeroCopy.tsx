import { Text } from './Text';
import { ArrowRight, PlayIcon } from './icons';

export default function HeroCopy() {
  return (
    <div className="copy">
      <div className="eyebrow">
        <span className="L" id="eyeLine" />
        <Text id="eyeText" text="THE PRODUCTIVITY HUB" />
      </div>

      <h1>
        <Text id="h1a" text="Bring Your Apps" />
        <Text id="h1b" text="and Work Together." />
      </h1>

      <Text
        as="p"
        id="sub"
        text="Connect your favorite tools, streamline your workflow, and get more done — all in one place."
      />

      <div className="ctas">
        <a className="L btn dark" id="btn1" href="#">
          <Text id="btn1Text" text="Get Started for Free" />
          <ArrowRight className="L" id="btn1Arrow" />
        </a>
        <a className="L btn" id="btn2" href="#">
          <PlayIcon className="L" id="btn2Icon" />
          <Text id="btn2Text" text="Watch Demo" />
        </a>
      </div>
    </div>
  );
}
