import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">
        🏠 Welcome to My Tailwind + React App
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm hover:shadow-2xl transition-all duration-300">
        <img
          src="https://images.unsplash.com/photo-1568605114967-8130f3a36994"
          alt="Modern Apartment"
          className="rounded-xl mb-4"
        />
        <h2 className="text-2xl font-semibold text-gray-800">3BHK Apartment</h2>
        <p className="text-gray-600 mt-2">📍 Pune, Wakad</p>
        <p className="text-green-600 font-bold mt-2">₹1.1 Cr</p>

        <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
          View Details
        </button>
      </div>
    </div>
  );
}

export default App;
