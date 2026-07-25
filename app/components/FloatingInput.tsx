import type { InputHTMLAttributes } from 'react';

// Floating-label input (Uiverse.io/liyaxu123 deseni, projeye uyarlanmış).
// Label metnini HARF HARF span'e böler; her harf artan gecikmeyle animasyonlanır.
// Stil globals.css'te (.ls-*), renkler tema değişkenine bağlı. Boş/dolu ayrımı
// :not(:placeholder-shown) ile olduğu için input'a placeholder=" " ŞART.
export default function FloatingInput({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="ls-field">
      <input className="ls-input" placeholder=" " {...props} />
      <label className="ls-label" htmlFor={props.id}>
        {[...label].map((ch, i) => (
          <span key={i} style={{ transitionDelay: `${i * 40}ms` }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </label>
    </div>
  );
}
