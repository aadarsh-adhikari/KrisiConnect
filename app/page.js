import Hero from "./components/Hero";
import MarketplacePreview from "./components/MarketplacePreview";
import FarmerCTA from "./components/FarmerCTA";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default async function Home() {
  let products = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products`);
    if (res.ok) products = await res.json();
  } catch (e) {
    // ignore
  }

  return (
    <main className="font-sans">
      <Hero />
      <Features />
      <MarketplacePreview products={products} />
      <FarmerCTA />
      <Footer />
    </main>
  );
}
