// src/App.jsx or pages/index.jsx
export default function App() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-teal-600 mb-4">
          Tailwind is Working! ✅
        </h1>
        <p className="text-gray-700">
          If you can see this styled component, Tailwind CSS is correctly installed.
        </p>
        <button className="mt-4 px-6 py-2 bg-white text-white rounded hover:bg-teal-600">
          Test Button
        </button>
      </div>
    </div>
  );
}
