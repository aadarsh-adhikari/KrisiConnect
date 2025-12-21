import Link from "next/link";

export default function About() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-700">About KrisiConnect</h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">A simple marketplace that connects buyers and farmers directly — no middleman, fair prices, and fresher food for everyone.</p>
        </header>

        <section className="grid gap-8 md:grid-cols-2 items-start mb-12">
          <div className="bg-green-50 p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-green-800 mb-3">Our Mission</h2>
            <p className="text-gray-700">We empower small and medium farmers to reach local buyers directly, enabling transparent pricing, sustainable practices, and stronger rural economies. By cutting out intermediaries, we help farmers keep a fairer share of revenue and provide buyers with fresher produce.</p>
            <ul className="mt-4 list-disc list-inside text-gray-700 space-y-2">
              <li>Direct farmer-buyer connections</li>
              <li>Transparent pricing set by farmers</li>
              <li>Sustainable and seasonal produce</li>
            </ul>
          </div>

          <div className="p-8 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">How it works</h3>
            <ol className="space-y-4 text-gray-700">
              <li>
                <strong>Farmers list products:</strong> Farmers create listings with photos, quantity, and price — they control the price and availability.
              </li>
              <li>
                <strong>Buyers browse & order:</strong> Buyers search nearby produce, compare, and order directly from the farmer's listing.
              </li>
              <li>
                <strong>Local delivery or pickup:</strong> Delivery options are arranged by the farmer or processed locally for quick fulfillment.
              </li>
            </ol>
            <div className="mt-6">
              <Link href="/marketplace" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">Explore Marketplace</Link>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold text-gray-800">For Farmers</h4>
              <p className="text-gray-600 mt-2">Set your own prices, reach local buyers, and keep more of your earnings with transparent fees and easy listing tools.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold text-gray-800">For Buyers</h4>
              <p className="text-gray-600 mt-2">Discover fresh, seasonal produce from nearby farms with clear pricing and direct communication with sellers.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold text-gray-800">For Communities</h4>
              <p className="text-gray-600 mt-2">Support sustainable practices, reduce food miles, and strengthen local economies by buying directly from farmers.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Frequently asked questions</h3>
          <div className="space-y-4">
            <details className="bg-white p-4 rounded-lg shadow">
              <summary className="font-semibold text-gray-800">Can farmers set their own prices?</summary>
              <p className="mt-2 text-gray-600">Yes — farmers list their products with prices they choose. We provide recommended pricing guidance but the final price is set by the farmer.</p>
            </details>
            <details className="bg-white p-4 rounded-lg shadow">
              <summary className="font-semibold text-gray-800">How are deliveries handled?</summary>
              <p className="mt-2 text-gray-600">Delivery options depend on the listing — some farmers offer local delivery, others arrange pickups. Buyers can contact the farmer for custom logistics.</p>
            </details>
            <details className="bg-white p-4 rounded-lg shadow">
              <summary className="font-semibold text-gray-800">Is there a fee?</summary>
              <p className="mt-2 text-gray-600">Platform fees are transparent and kept minimal to ensure farmers retain fair earnings. Any fees will be displayed at checkout.</p>
            </details>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Meet the team</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3" />
              <p className="font-semibold">Asha Patel</p>
              <p className="text-sm text-gray-500">Founder</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3" />
              <p className="font-semibold">Rahul Verma</p>
              <p className="text-sm text-gray-500">Product</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3" />
              <p className="font-semibold">Neha Singh</p>
              <p className="text-sm text-gray-500">Operations</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3" />
              <p className="font-semibold">Vikram Rao</p>
              <p className="text-sm text-gray-500">Community</p>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link href="/marketplace" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold">Explore marketplace</Link>
        </div>
      </div>
    </main>
  );
}
