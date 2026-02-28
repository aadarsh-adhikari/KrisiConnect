import Link from "next/link";
import ContactSection from "../components/ContactSection";
import { FaLeaf, FaSeedling, FaUsers, FaTruck } from 'react-icons/fa';
import Image from "next/image";
export default function About() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* HERO */}
      <section className="relative bg-[url('/logo/field-hero.jpg')] bg-cover bg-center h-[56vh] flex items-center">
        <div className="absolute inset-0 bg-linear-to-b from-green-400 via-transparent to-white/60"></div>
        <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="max-w-3xl text-center mx-auto py-12">
            <div className="inline-block px-3 py-1 rounded-full bg-black/60 text-xs text-white mb-4">Connecting food from soil to market</div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg leading-tight">Bridging the Gap Between Soil and Market</h1>
            <p className="mt-6 text-white/90 text-lg md:text-xl">Empowering the hands that feed us by connecting farmers directly with buyers fresher produce, fairer prices.</p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/marketplace" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold shadow">Visit Marketplace</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 md:px-12 -mt-20">
        {/* Rooted in Fairness */}
        <section className="bg-white rounded-xl shadow p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-2/3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Rooted in Fairness</h2>
            <p className="mt-4 text-gray-600">Krisi Connect began with a simple observation: while technology was advancing everywhere else, the agricultural supply chain remained fragmented. Farmers were losing value to middlemen, and buyers were paying premiums without quality assurance. We built this platform to be the digital bridge bringing transparency, trust, and fair value to producers and buyers alike.</p>
            <p className="mt-4 text-gray-600 font-medium">We believe that honest pricing and local access should reward the work of cultivation fairly and sustainably.</p>
          </div>
          <div className="md:w-1/3 bg-green-50 rounded-lg p-6 shadow-inner text-center">
            <Image src="/logo/logo.png" alt="Seedling" width={144} height={144} className="object-cover mx-auto rounded-lg" />
            <div className="mt-4 text-sm text-gray-500">Trusted by 10,000+ Farmers</div>
          </div>
        </section>

        {/* Mission + Vision */}
        <section className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow flex gap-4 items-start">
            <div className="bg-green-50 text-green-700 p-3 rounded-lg">
              <FaSeedling className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Our Mission</h3>
              <p className="text-sm text-gray-600 mt-2">To eliminate middlemen and democratize market access ensuring fair prices and transparent transactions for every harvest.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex gap-4 items-start">
            <div className="bg-gray-100 text-green-700 p-3 rounded-lg">
              <FaLeaf className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Our Vision</h3>
              <p className="text-sm text-gray-600 mt-2">A connected world where fresh, high-quality produce is accessible to all, farming is dignified and profitable, and food waste is minimized.</p>
            </div>
          </div>
        </section>

        {/* Value for Everyone */}
        <section className="bg-white rounded-2xl p-6 shadow mb-8">
          <h3 className="text-xl font-bold mb-4">Value for Everyone</h3>
          <p className="text-sm text-gray-600 mb-6">Whether you are growing the food or bringing it to the table, KrisiConnect simplifies the journey.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-xl flex gap-4 items-start">
              <div className="p-3 bg-white rounded-lg shadow text-green-700">
                <FaUsers className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">For Farmers</h4>
                <ul className="mt-2 text-sm text-gray-600 space-y-2">
                  <li>Direct market access without intermediaries</li>
                  <li>Instant payments after confirmation</li>
                  <li>Logistics support for bulk orders</li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl flex gap-4 items-start border">
              <div className="p-3 bg-green-50 rounded-lg text-green-700">
                <FaTruck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">For Buyers</h4>
                <ul className="mt-2 text-sm text-gray-600 space-y-2">
                  <li>Farm fresh quality with clear provenance</li>
                  <li>End to end traceability for produce</li>
                  <li>Transparent bulk pricing for orders</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact + FAQ (two-column) */}
          <ContactSection />

          <div>
            <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <details className="bg-white p-4 rounded-lg shadow">
                <summary className="font-semibold">How do I list my produce on Krisi Connect?</summary>
                <p className="mt-2 text-sm text-gray-600">Create a seller account, add your product details (photos, quantity, price) and publish the listing. Buyers will see it in the marketplace.</p>
              </details>

             
              <details className="bg-white p-4 rounded-lg shadow">
                <summary className="font-semibold">How are payments handled?</summary>
                <p className="mt-2 text-sm text-gray-600">Payments are arranged directly between buyers and sellers via the chat feature. We don’t collect any commission the platform simply facilitates connection and communication.</p>
              </details>

              <details className="bg-white p-4 rounded-lg shadow">
                <summary className="font-semibold">Can I change or cancel my order?</summary>
                <p className="mt-2 text-sm text-gray-600">Buyers can cancel orders from their dashboard while the status is still pending. Sellers can also cancel through their orders panel. After cancellation, stock is automatically restored.</p>
              </details>

              <details className="bg-white p-4 rounded-lg shadow">
                <summary className="font-semibold">Do I need to pay a fee to use Krisi Connect?</summary>
                <p className="mt-2 text-sm text-gray-600">No. The platform is free for both buyers and sellers. We don’t take any commission or listing fees; our goal is to support direct trade.</p>
              </details>

              <details className="bg-white p-4 rounded-lg shadow">
                <summary className="font-semibold">How do I contact support?</summary>
                <p className="mt-2 text-sm text-gray-600">You can reach out through the contact form on the website or via the chat feature once logged in. We’re happy to help with any questions or issues.</p>
              </details>

            
            </div>
          </div>

        {/* Team */}
        {/* <section className="mb-12 mt-8 text-center">
          <h3 className="text-2xl font-bold mb-6">Meet the team</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-3" />
              <p className="font-semibold">Aadarsh Adhikari</p>
              <p className="text-sm text-gray-500">Founder</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-3" />
              <p className="font-semibold">Bikesh Gautam</p>
              <p className="text-sm text-gray-500">Founder</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-3" />
              <p className="font-semibold">Coming Soon</p>
              <p className="text-sm text-gray-500">Team</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-3" />
              <p className="font-semibold">Coming Soon</p>
              <p className="text-sm text-gray-500">Team</p>
            </div>
          </div>
        </section> */}

      </div>
    </main>
  );
}
