import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search");

  // Fetch products (with backend search)
  // useEffect(() => {
  //   if (searchQuery) {
  //     axios
  //       .get(`http://localhost:8080/products/search?q=${searchQuery}`)
  //       .then((res) => {
  //         setProducts(res.data);
  //       })
  //       .catch((err) => console.log("ERROR:", err));
  //   } else {
  //     axios
  //       .get("http://localhost:8080/products")
  //       .then((res) => {
  //         setProducts(res.data);
  //       })
  //       .catch((err) => console.log("ERROR:", err));
  //   }
  // }, [searchQuery]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/products")
      .then((res) => {
        const data = res.data;
        setAllProducts(data); // store full list

        if (searchQuery && searchQuery.trim() !== "") {
          const search = searchQuery.toLowerCase();

          const filtered = data.filter((p) => {
            const name = p.name.toLowerCase();

            return (
              name.startsWith(search) ||
              name.split(" ").some(word => word.startsWith(search))
            );
          });

          setProducts(filtered);
        } else {
          setProducts(data);
        }
      })
      .catch((err) => console.log("ERROR:", err));
  }, [searchQuery]);

  // Recommendation logic based on category
  // const recommended = products.filter(
  //   (p) => p.category && products.length > 0 && p.category === products[0]?.category
  // ).slice(0, 4);
  const recommended = allProducts
    .filter(
      (p) =>
        p.category &&
        products.length > 0 &&
        p.category === products[0]?.category &&
        !products.some((sp) => sp.id === p.id) // ❌ remove duplicates
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 px-4 sm:px-6 pt-24 pb-16">

      {/* 🔥 HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
        </h1>
        <p className="text-gray-500 mt-2 text-base">
          {products.length} {products.length === 1 ? 'item' : 'items'} found
        </p>
      </div>

      {/* ⚡ GRID */}
      {products.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">No products found for your search.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      )}

      {/* 🔥 RECOMMENDATIONS */}
      {searchQuery && recommended.length > 0 && (
        <div className="mt-16 max-w-7xl mx-auto border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Recommended For You
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommended.map((p, index) => (
              <motion.div
                key={`rec-${p.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default Products;