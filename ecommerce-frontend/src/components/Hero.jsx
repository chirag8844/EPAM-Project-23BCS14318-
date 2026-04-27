import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const products = [
  { id: 1, name: "iPhone" },
  { id: 2, name: "Laptop" },
  { id: 3, name: "Shoes" },
  { id: 4, name: "Watch" },
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setIndex((prev) => (prev + 1) % products.length);
    }, 2500);
    return () => clearInterval(i);
  }, []);

  return (
    <section className="h-screen flex flex-col justify-center items-center text-white relative overflow-hidden pt-24">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-600 to-indigo-700 animate-pulse" />

      {/* Floating Product */}
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.7, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-3xl font-bold mb-6"
      >
        {products[index].name}
      </motion.div>

      {/* Text */}
      <h1 className="text-5xl font-bold z-10 text-center">
        Discover Amazing Products
      </h1>
      <p className="z-10 mt-4 text-lg">
        From Trusted Vendors Worldwide
      </p>

      {/* CTA */}
      <div className="flex gap-4 mt-6 z-10">
        <button className="px-6 py-3 bg-white text-black rounded-lg">
          Shop Now
        </button>
        <button className="px-6 py-3 border border-white rounded-lg">
          Become Vendor
        </button>
      </div>
    </section>
  );
}