import Image from "next/image";
import ProductCard from './components/ProductCard';

export default function Home() {
  return (
    <div className="font-sans">
      
      <section 
        className="relative min-h-[500px] bg-cover bg-center bg-no-repeat flex items-center"
        style={{backgroundImage: "url('/logo/bgimage.png')"}}
      >
        
        <div className="relative z-10 max-w-lg ml-6 md:ml-16 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-black">
            Connecting Farmers and Buyers — Fresh, Fair, and Direct.
          </h1>
          <div className="space-x-4">
            <button className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700">Shop Now</button>
            <button className="bg-white text-green-600 px-6 py-3 rounded hover:bg-gray-100">Join as Farmer</button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="p-6 md:p-16 text-center">
        <h2 className="text-3xl font-bold mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="text-green-600 text-4xl">👨‍🌾</div>
            <p>Farmers list their fresh produce.</p>
          </div>
          <div className="space-y-4">
            <div className="text-green-600 text-4xl">🛒</div>
            <p>Buyers explore and purchase directly.</p>
          </div>
          <div className="space-y-4">
            <div className="text-green-600 text-4xl">🚚</div>
            <p>Products delivered fresh to your door.</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      
      <ProductCard/>
      {/* Testimonials */}
      <section className="p-6 md:p-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Testimonials</h2>
        <p className="max-w-xl mx-auto text-lg italic">
          "I earn 20% more since joining KrisiConnect!" <br /> — Ajay, Farmer
        </p>
      </section>

      {/* Footer */}
      <footer className="p-6 md:p-16 bg-gray-100 flex flex-col md:flex-row justify-between items-center">
        <div className="space-x-4">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Help</a>
        </div>
        <div className="mt-4 md:mt-0 flex">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 border rounded-l"
          />
          <button className="bg-green-600 text-white px-4 rounded-r">Subscribe</button>
        </div>
      </footer>
    </div>
  );
}
