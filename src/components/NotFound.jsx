import { Link } from 'react-router-dom';

export default function NotFound({ to = '/', label = 'Back to home' }) {
  return (
    <div className="empty">
      <h1>Page not found</h1>
      <p>That page doesn't exist.</p>
      <Link to={to} className="btn btn-primary">{label}</Link>
    </div>
  );
}
