import React from 'react'

const Navbar = () => {
  return (
      <header className="flex justify-between items-center p-6 bg-white shadow">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-full"></div>
          <span className="font-bold text-lg">KRISICONNECT</span>
        </div>
        <nav className="space-x-6 hidden md:flex">
          <a href="#" className="hover:text-green-600">Home</a>
          <a href="/marketplace" className="hover:text-green-600">Marketplace</a>
          <a href="#" className="hover:text-green-600">Farmers</a>
          <a href="#" className="hover:text-green-600">About</a>
          <a href="#" className="hover:text-green-600">Contact</a>
        </nav>
        <div className="space-x-3">
          <button className="px-4 py-2">Login</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded">Suit on KrisiConnect</button>
        </div>
      </header>

    
  )
}

export default Navbar
