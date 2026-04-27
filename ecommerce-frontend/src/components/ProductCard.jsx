import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ProductCard({ product }) {
  const navigate = useNavigate();

  // Basic info fallbacks and resolve relative backend URLs
  const imageUrlRaw = (product.images && product.images.length > 0)
    ? product.images[0]
    : `https://picsum.photos/seed/${product.id || 1}/400/300`;

  const imageUrl = imageUrlRaw && (imageUrlRaw.startsWith("http") || imageUrlRaw.startsWith("data:"))
    ? imageUrlRaw
    : `${api.defaults.baseURL}${imageUrlRaw}`;

  const discountedPrice = product.discountPercentage > 0
    ? product.price - (product.price * (product.discountPercentage / 100))
    : product.price;

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col group border border-gray-100 h-full"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* 🖼 IMAGE CONTAINER */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {product.discountPercentage > 0 && product.quantity > 0 && (
          <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm z-10">
            {product.discountPercentage}% OFF
          </span>
        )}
        {product.quantity <= 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm z-10">
            OUT OF STOCK
          </span>
        )}
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Wishlist Button (Heart icon) */}
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      </div>

      {/* 📦 CONTENT */}
      <div className="p-4 flex flex-col flex-grow">
        {/* BRAND & CATEGORY (Hierarchy 3) */}
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 truncate">
          {product.brand || product.category || "General"}
        </div>

        {/* TITLE (Hierarchy 1) */}
        <h2 className="text-sm font-semibold text-gray-800 leading-snug mb-1 group-hover:text-purple-600 transition-colors line-clamp-2" title={product.name}>
          {product.name}
        </h2>

        {/* RATINGS */}
        <div className="flex items-center space-x-1.5 mb-3 mt-1">
           <div className="flex items-center bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded gap-0.5">
             {product.rating || "4.1"}
             <svg className="w-2.5 h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
           </div>
           <span className="text-gray-400 text-xs font-medium">({product.totalReviews || 124})</span>
        </div>

        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
            {/* PRICE (Hierarchy 2) */}
            <div className="flex items-baseline space-x-2">
                <span className="text-gray-900 font-bold text-base">
                    ₹{discountedPrice.toFixed(0)}
                </span>
                {product.discountPercentage > 0 && (
                    <span className="text-gray-400 text-xs line-through decoration-gray-400">
                    ₹{product.price}
                    </span>
                )}
            </div>
            
            {/* Action Icon */}
            <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
