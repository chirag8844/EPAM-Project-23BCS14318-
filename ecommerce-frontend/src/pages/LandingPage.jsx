import SearchBar from "../components/SearchBar";
import Navbar from "../components/Navbar";
import FeaturedProducts from "../components/FeaturedProducts";
import Vendors from "../components/Vendors";
import WhyChooseUs from "../components/WhyChooseUs";
import Stats from "../components/Stats";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const sampleProducts = [
  { id: 1, name: "iPhone", price: "₹80,000", img: "https://images.macrumors.com/t/q6mJocI2RjijaF8CV_NbzwIrFv0=/2500x0/filters:no_upscale()/article-new/2025/07/iPhone-17-Pro-Dark-Blue-and-Orange.jpg" },
  { id: 2, name: "Laptop", price: "₹55,000", img: "https://cdn.mos.cms.futurecdn.net/pCXX9UGDmE5UJJHM5a8ei4.jpg" },
  { id: 3, name: "Shoes", price: "₹3,000", img: "https://hips.hearstapps.com/hmg-prod/images/hoka-zinal-13085-1643565794.jpg" },
  { id: 4, name: "Watch", price: "₹5,000", img: "https://i.pinimg.com/736x/0c/e8/29/0ce8299f7b1c845d575f949b244ea238.jpg" },
];

const features = [
  { title: "Wide Variety", desc: "Explore products from multiple vendors", color: "from-purple-500/20 to-blue-500/20" },
  { title: "Secure Payments", desc: "Safe and fast transactions", color: "from-blue-500/20 to-cyan-500/20" },
  { title: "Fast Delivery", desc: "Quick doorstep delivery", color: "from-pink-500/20 to-purple-500/20" },
];

function LandingPage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % sampleProducts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div className="text-white selection:bg-purple-500/30">
      <Navbar />

      <div
        className="min-h-screen relative"
        style={{
          backgroundImage: "url('/images/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-brightness-50 -z-10" />

        {/* 🎯 HERO SECTION */}
        <div className="text-center pt-32 pb-16 px-4 relative overflow-visible">
          <div className="absolute inset-0 flex justify-center items-center -z-10 overflow-hidden">
            <div className="w-[800px] h-[400px] bg-purple-600/20 blur-[150px] animate-pulse rounded-full" />
            <div className="w-[600px] h-[300px] bg-blue-600/20 blur-[120px] animate-pulse rounded-full absolute -top-20" />
          </div>

          {/* 🧵 HEADING WITH FABRIC UNDERLINE */}
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-7xl font-black tracking-tight relative z-10">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
                Discover Amazing Products
              </span>
            </h1>

            {/* ✨ FABRIC STRIP */}
            <div className="absolute left-0 right-0 -bottom-3 h-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 opacity-30 blur-sm rounded-full"></div>
          </div>

          {/* SUBTEXT */}
          <p className="mt-6 text-slate-900 text-xl md:text-2xl max-w-2xl mx-auto">
            Curated Excellence <span className="mx-2 text-black">|</span>
            <span className="text-slate-800 font-semibold">
              From Trusted Multi Vendors
            </span>
          </p>


          <div className="mt-12 max-w-3xl mx-auto relative z-[999]">
            <SearchBar products={products} />
          </div>

        </div>


        {/* 🔄 CIRCULAR SHOWCASE */}
        <div className="flex justify-center items-center py-24 relative">
          <div className="relative w-[500px] h-[500px] flex justify-center items-center">
            {sampleProducts.map((product, i) => {
              const angle = (i / sampleProducts.length) * 2 * Math.PI;
              const radius = 190;
              const x = Math.cos(angle + index * 0.5) * radius;
              const y = Math.sin(angle + index * 0.5) * radius;
              const isActive = i === index;

              return (
                <motion.div
                  key={product.id}
                  animate={{
                    x, y,
                    scale: isActive ? 1.25 : 0.75,
                    opacity: isActive ? 1 : 0.3,
                    filter: isActive ? "blur(0px)" : "blur(2px)",
                  }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  className="absolute w-[150px] h-[150px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-white/5 backdrop-blur-xl"
                >
                  <img src={product.img} alt="" className="w-full h-full object-cover" />
                </motion.div>
              );
            })}

            <div className="absolute w-[220px] h-[220px] bg-white/5 backdrop-blur-2xl rounded-full shadow-[0_0_50px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center z-10 border border-white/20">
              <h2 className="text-2xl font-black text-center px-4 tracking-tight">
                {sampleProducts[index].name}
              </h2>
              <p className="text-emerald-400 font-black text-xl mt-1">
                {sampleProducts[index].price}
              </p>
            </div>
          </div>
        </div>

        {/* 🧩 FEATURES SECTION (REDESIGNED) */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-10 pb-32">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl bg-black/60 bg-gradient-to-br ${feature.color} relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <div className="w-20 h-20 bg-white rounded-full blur-2xl" />
              </div>
              <h3 className="font-black text-2xl mb-3 tracking-tight text-white">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed font-light">{feature.desc}</p>
              <div className="mt-6 w-12 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
            </motion.div>
          ))}
        </div>

        {/* 🔥 EXTRA SECTIONS */}
        <div className="space-y-4 shadow-black/50">
          <FeaturedProducts />
          <Vendors />
          <WhyChooseUs />
          <Stats />
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
