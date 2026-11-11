import type { CSSProperties } from 'react';

/**
 * A text layer. `data-text` keeps the final copy so the animation
 * can clear it and type it back in, letter by letter.
 */
export function Text({ id, text, className = '', style, as: Tag = 'span' }: {
  id: string; text: string; className?: string; style?: CSSProperties; as?: 'span' | 'p' | 'div';
}) {
  return (
    <Tag id={id} className={`L t ${className}`} data-text={text} style={style}>
      {text}
    </Tag>
  );
}
