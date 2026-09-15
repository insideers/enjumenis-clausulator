import { managerInfo, initials } from '../../shared/managers.js';

export function Badge({ name, size = 'md' }) {
  const info = managerInfo(name);
  return (
    <span className={`badge badge-${size}`} style={{ '--c': info.color }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function Manager({ name, short = false, size = 'sm' }) {
  const info = managerInfo(name);
  return (
    <span className="manager">
      <Badge name={name} size={size} />
      <span className="manager-name" title={name}>
        {short ? info.short : name}
      </span>
    </span>
  );
}
