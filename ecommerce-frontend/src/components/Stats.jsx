import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Stats() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = 10100;
    const duration = 2000;
    const stepTime = Math.abs(Math.floor(duration / (end / 100)));
    
    const timer = setInterval(() => {
      start += 100;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative inline-block"
      >
        {/* Subtle Glow Background */}
        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <h2 className="text-8xl md:text-[10rem] font-black leading-none tracking-tighter">
          <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]">
            {count.toLocaleString()}+
          </span>
        </h2>
        <p className="text-2xl md:text-3xl font-bold text-gray-400 mt-4 tracking-[0.5em] uppercase">
          Curated Products
        </p>
      </motion.div>
    </section>
  );
}