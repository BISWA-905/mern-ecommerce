import { Link } from 'react-router-dom';
import Stars from './Stars';
import { formatPrice } from '../utils/format';

function ProductCard({ product }) {
  const image = product.images?.[0];
  const outOfStock = product.stock === 0;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        {outOfStock && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1 flex-1">
        {product.category?.name && (
          <span className="text-xs uppercase tracking-wide text-gray-500">
            {product.category.name}
          </span>
        )}
        <h3 className="font-semibold text-gray-800 line-clamp-2">
          {product.name}
        </h3>
        <Stars rating={product.rating} count={product.numReviews} />
        <p className="mt-auto pt-2 text-lg font-bold text-indigo-600">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

export default ProductCard;