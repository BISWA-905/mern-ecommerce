import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
      <p className="text-6xl font-bold text-indigo-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-800">
        We could not find that page
      </h1>
      <p className="mt-2 text-gray-500">
        The address may be wrong, or the page may have moved.
      </p>
      <Link
        to="/"
        className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg"
      >
        Back to the home page
      </Link>
    </div>
  );
}

export default NotFound;