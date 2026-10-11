import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, text, actionLabel, actionTo }) {
  return (
    <div className="empty">
      {Icon && <Icon size={32} aria-hidden="true" />}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {actionTo && <Link to={actionTo} className="btn btn-primary">{actionLabel}</Link>}
    </div>
  );
}
