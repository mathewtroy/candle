import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div className="container text-center">
      <h2>404 - Page Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="btn">
        Go Home
      </Link>
    </div>
  );
}
