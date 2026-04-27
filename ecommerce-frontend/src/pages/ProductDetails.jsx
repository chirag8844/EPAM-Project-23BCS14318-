import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return fallback;
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for variants
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  // Delivery estimates
  const [deliveryRange, setDeliveryRange] = useState("");
  const [orderWithin, setOrderWithin] = useState("");

  // compute delivery range and countdown
  useEffect(() => {
    const cutoffHour = 18; // 6 PM cutoff

    function addDays(d, days) {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + days);
      return nd;
    }

    function formatShort(date) {
      const day = date.toLocaleString(undefined, { day: 'numeric' });
      const month = date.toLocaleString(undefined, { month: 'short' });
      const weekday = date.toLocaleString(undefined, { weekday: 'short' });
      return `${day} ${month}, ${weekday}`; // e.g. 25 Apr, Fri
    }

    function compute() {
      const now = new Date();
      const start = addDays(now, 5);
      const end = addDays(now, 6);
      setDeliveryRange(`${formatShort(start)} - ${formatShort(end)}`);

      // compute time until cutoff (today 6 PM or next day 6 PM)
      let cutoff = new Date(now);
      cutoff.setHours(cutoffHour, 0, 0, 0);
      if (now >= cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }
      const diff = cutoff.getTime() - now.getTime();
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setOrderWithin(`Order within ${hrs} hrs ${mins} mins`);
    }

    compute();
    const iv = setInterval(compute, 60 * 1000);

    function onOrderPlaced() { compute(); }
    window.addEventListener('order:placed', onOrderPlaced);

    return () => {
      clearInterval(iv);
      window.removeEventListener('order:placed', onOrderPlaced);
    };
  }, []);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        if (res.data.images && res.data.images.length > 0) {
          const raw = res.data.images[0];
          const resolved = raw && (raw.startsWith("http") || raw.startsWith("data:")) ? raw : `${api.defaults.baseURL}${raw}`;
          setSelectedImage(resolved);
        } else {
          setSelectedImage(`https://picsum.photos/seed/${res.data.id || 1}/600/600`);
        }
        if (res.data.availableSizes && res.data.availableSizes.length > 0) {
          setSelectedSize(res.data.availableSizes[0]);
        }
        if (res.data.availableColors && res.data.availableColors.length > 0) {
          setSelectedColor(res.data.availableColors[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product", err);
        setLoading(false);
      });
  }, [id]);

  const isAuthenticated = () => !!sessionStorage.getItem('token');

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    try {
      await api.post('/cart/add', { productId: product.id, quantity: 1 });
      // notify other components (navbar) to refresh counts
      try { window.dispatchEvent(new Event('cart:updated')); } catch (e) {}
      alert('Added to cart');
    } catch (e) {
      console.error('Add to cart failed', e);
      alert(getErrorMessage(e, 'Failed to add to cart'));
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    try {
      await api.post('/cart/add', { productId: product.id, quantity: 1 });
      try { window.dispatchEvent(new Event('cart:updated')); } catch (e) {}
      navigate('/checkout', { state: { selectedProductId: product.id } });
    } catch (e) {
      console.error('Buy now failed', e);
      alert(getErrorMessage(e, 'Failed to start checkout'));
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-700">Product not found</h2>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Back to Search
        </button>
      </div>
    );
  }

  const discountedPrice = product.discountPercentage > 0
    ? product.price - (product.price * (product.discountPercentage / 100))
    : product.price;

  // Mock Reviews
  const reviews = [
    { id: 1, name: "Rahul S.", rating: 5, date: "Oct 2026", comment: "Excellent product, exactly as described! Delivery was incredibly fast as well." },
    { id: 2, name: "Priya M.", rating: 4, date: "Sep 2026", comment: "Good quality, worth the price. The material feels premium." },
    { id: 3, name: "Amit K.", rating: 5, date: "Sep 2026", comment: "Absolutely love it. Would recommend to others looking for something reliable." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl flex flex-col md:flex-row overflow-hidden border border-white/50">

        {/* LEFT COLUMN: IMAGE SECTION */}
        <div className="w-full md:w-2/5 p-6 border-r border-gray-100 sticky top-0 h-max">
          <div className="flex gap-4">
            {/* Thumbnail Gallery */}
            <div className="hidden sm:flex flex-col gap-2 w-16">
              {(product.images && product.images.length > 0 ? product.images : [selectedImage, selectedImage, selectedImage]).slice(0, 5).map((img, idx) => {
                const resolved = img && (img.startsWith("http") || img.startsWith("data:")) ? img : `${api.defaults.baseURL}${img}`;
                return (
                  <div
                    key={idx}
                    className={`border-2 rounded cursor-pointer h-16 overflow-hidden flex items-center justify-center ${selectedImage === resolved ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                    onMouseEnter={() => setSelectedImage(resolved)}
                  >
                    <img src={resolved} alt="Thumbnail" className="w-full h-full object-contain mix-blend-multiply bg-gray-50" />
                  </div>
                );
              })}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative border border-gray-100 rounded-lg overflow-hidden flex justify-center items-center h-[500px] bg-gray-50">
              <img src={selectedImage} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              disabled={product.quantity <= 0}
              className={`flex-1 py-3.5 px-4 rounded font-medium text-lg uppercase tracking-wide shadow-sm transition-colors flex justify-center items-center gap-2 ${product.quantity <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#ff9f00] hover:bg-[#f39800] text-white'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" /></svg>
              {product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.quantity <= 0}
              className={`flex-1 py-3.5 px-4 rounded font-medium text-lg uppercase tracking-wide shadow-sm transition-colors flex justify-center items-center gap-2 ${product.quantity <= 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#fb641b] hover:bg-[#eb5e1a] text-white'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {product.quantity <= 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILS */}
        <div className="w-full md:w-3/5 p-6 md:p-8">

          {/* Breadcrumb pseudo */}
          <div className="text-xs text-gray-500 mb-2 font-medium tracking-wide">
            Home / {product.category || 'Category'} / <span className="text-gray-800">{product.brand || 'Brand'}</span>
          </div>

          <h1 className="text-xl md:text-2xl text-gray-900 font-normal leading-tight mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-sm flex items-center gap-1">
              {product.rating || "4.1"} <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
            </span>
            <span className="text-sm font-medium text-gray-500 cursor-pointer hover:text-blue-600">
              {product.totalReviews || "124"} Ratings & 16 Reviews
            </span>
            {product.brand && (
              <span className="ml-auto inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 font-bold italic tracking-wider rounded-sm">
                {product.brand.toUpperCase()}
              </span>
            )}
          </div>

          {/* Pricing Block */}
          <div className="flex items-end gap-3 mb-4">
            <span className="text-3xl font-semibold text-gray-900">₹{discountedPrice.toFixed(0)}</span>
            {product.discountPercentage > 0 && (
              <>
                <span className="text-lg text-gray-500 line-through mb-0.5">₹{product.price}</span>
                <span className="text-green-600 text-base font-semibold mb-0.5">{product.discountPercentage}% off</span>
              </>
            )}
          </div>

          <div className="text-sm font-medium text-gray-800 mb-6 flex gap-1">
            <span>Packaging fee:</span><span className="text-green-600 font-bold ml-1">FREE</span>
          </div>

          {/* Offers */}
          <div className="mb-8 hidden sm:block">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Available offers</h3>
            <ul className="text-sm space-y-2">
              <li className="flex gap-2 items-start text-gray-700">
                <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                <span><strong>Bank Offer:</strong> 5% Cashback on Flipkart Axis Bank Card</span>
              </li>
              <li className="flex gap-2 items-start text-gray-700">
                <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                <span><strong>Special Price:</strong> Get extra 10% off (price inclusive of cashback/coupon)</span>
              </li>
              {/* <li className="flex gap-2 items-start text-gray-700">
                <svg className="w-5 h-5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                <span><strong>EMI starting</strong> from ₹150/month. View Plans</span>
              </li> */}
            </ul>
          </div>

          <div className="flex flex-col gap-6 w-full border-t border-gray-200 mt-6 pt-6">

            {/* Color variants */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="w-20 text-gray-500 font-semibold text-sm">Color</span>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 border rounded cursor-pointer text-sm font-medium transition-all ${selectedColor === c ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size variants */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="w-20 text-gray-500 font-semibold text-sm">Size</span>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSize(s)}
                      className={`w-10 h-10 border rounded-full flex items-center justify-center font-medium transition-all ${selectedSize === s ? 'border-blue-600 text-blue-600 shadow-sm' : 'border-gray-300 text-gray-700 hover:border-blue-400'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <span className="text-blue-600 text-sm font-medium cursor-pointer ml-4">Size Chart</span>
              </div>
            )}

            {/* Delivery */}
            <div className="flex items-start gap-4 mt-2">
              <span className="w-20 text-gray-500 font-semibold text-sm pt-1">Delivery</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <input type="text" placeholder="Enter Pincode" className="border-b-2 border-purple-500 bg-transparent focus:outline-none focus:border-purple-700 text-sm py-1 w-48 font-medium text-gray-800" defaultValue="110001" />
                  <button className="text-purple-600 font-medium text-sm ml-4 hover:text-purple-800 transition">Check</button>
                </div>
                <div className="font-semibold text-sm text-gray-800 mt-2">
                  Delivery by {deliveryRange}
                  <span className="text-gray-400 font-normal"> | </span>
                  <span className="text-green-600 text-sm">Free</span>
                  <span className="line-through text-gray-400 text-xs ml-1">₹40</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{orderWithin}</p>
              </div>
            </div>

            {/* Highlights */}
            {product.highlights && Object.keys(product.highlights).length > 0 && (
              <div className="flex items-start gap-4 mt-2">
                <span className="w-20 text-gray-500 font-semibold text-sm hidden sm:block">Highlights</span>
                <div className="flex-1 text-sm text-gray-800">
                  <ul className="list-disc pl-5 space-y-1">
                    {Object.entries(product.highlights).map(([k, v], i) => (
                      <li key={i}><span className="font-medium">{k}:</span> {v}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Description fallback highlights if none exist */}
            {(!product.highlights || Object.keys(product.highlights).length === 0) && (
              <div className="flex items-start gap-4 mt-2">
                <span className="w-20 text-gray-500 font-semibold text-sm hidden sm:block">Highlights</span>
                <div className="flex-1 text-sm text-gray-800">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>100% Original Products</li>
                    <li>Pay on delivery might be available</li>
                    <li>Easy 14 days returns and exchanges</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Seller */}
            <div className="flex items-start gap-4 mt-2">
              <span className="w-20 text-gray-500 font-semibold text-sm">Seller</span>
              <div className="flex-1 text-sm text-purple-600 font-medium cursor-pointer hover:text-purple-800 transition">
                {product.sellerInfo || (product.vendor ? product.vendor.username : 'RetailNet')}
                <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2">4.8 ★</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: TABS */}
      <div className="max-w-7xl mx-auto mt-6 px-1">
        <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden border border-white/50">
          {/* Tabs header */}
          <div className="flex border-b border-gray-100">
            <button
              className={`px-6 py-4 text-sm uppercase tracking-wide font-bold flex-1 sm:flex-none transition-colors ${activeTab === 'description' ? 'border-b-4 border-purple-600 text-purple-600 bg-purple-50/50' : 'text-gray-500 hover:text-purple-500 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`px-6 py-4 text-sm uppercase tracking-wide font-bold flex-1 sm:flex-none transition-colors ${activeTab === 'reviews' ? 'border-b-4 border-purple-600 text-purple-600 bg-purple-50/50' : 'text-gray-500 hover:text-purple-500 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('reviews')}
            >
              Ratings & Reviews
            </button>
          </div>

          {/* Tabs Body */}
          <div className="p-6 md:p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-sm text-gray-700">
                <p>{product.description}</p>
                <p className="mt-4 text-gray-500 italic"></p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-light text-gray-900">{product.rating || "4.1"} <span className="text-2xl text-gray-400">★</span></span>
                    <span className="text-sm text-gray-500 mt-1">{product.totalReviews || "124"} Ratings &</span>
                    <span className="text-sm text-gray-500">16 Reviews</span>
                  </div>
                  <div className="flex-1 max-w-xs space-y-1 border-l pl-6 hidden sm:block">
                    {[5, 4, 3, 2, 1].map(r => (
                      <div key={r} className="flex items-center text-xs">
                        <span className="w-2">{r}</span>
                        <span className="text-gray-400 ml-1 mr-2">★</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${r === 5 ? 60 : r === 4 ? 20 : r === 3 ? 10 : r === 2 ? 5 : 5}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-100 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">{review.rating} ★</span>
                        <span className="font-semibold text-sm text-gray-800">{review.comment.split(' ')[0]} {review.comment.split(' ')[1]}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                      <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">{review.name}</span>
                          <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                          <span>Certified Buyer</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>{review.date}</span>
                          <div className="flex gap-3">
                            <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg> 12</span>
                            <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg> 2</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default ProductDetails;
