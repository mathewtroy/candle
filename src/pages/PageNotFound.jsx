import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="container">
      <h2>404 - Page Not Found</h2>
      <Link to="/">Go Home</Link>
    </div>
  );
}
