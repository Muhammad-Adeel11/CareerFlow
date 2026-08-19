export default function Spinner({ dark = false, size }) {
  const style = size ? { width: size, height: size } : undefined;
  return <span className={`spinner${dark ? ' spinner-dark' : ''}`} style={style} aria-hidden="true" />;
}
