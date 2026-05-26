import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="neo max-w-md p-10 text-center">
        <h1 className="text-7xl font-bold text-gradient-orange">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full gradient-orange px-6 py-3 text-sm font-semibold text-primary-foreground shadow-orange"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
