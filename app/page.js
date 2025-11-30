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
    </div>
  );
}
