function Stars({ rating = 0, count }) {
  const rounded = Math.round(rating);

  return (
    <span
      className="inline-flex items-center gap-1 text-sm"
      aria-label={`Rated ${rating} out of 5`}
    >
      <span className="text-yellow-400">
        {'★'.repeat(rounded)}
        <span className="text-gray-300">{'★'.repeat(5 - rounded)}</span>
      </span>
      {count !== undefined && (
        <span className="text-gray-500">({count})</span>
      )}
    </span>
  );
}

export default Stars;