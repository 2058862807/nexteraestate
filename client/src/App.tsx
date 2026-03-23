import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">NextEra Estate</h1>
        <p className="text-xl text-blue-700 mb-8">Loading...</p>
        <a 
          href={`${import.meta.env.VITE_API_URL || 'https://nexteraestate.onrender.com'}/api/auth/google`}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          Sign In with Google
        </a>
      </div>
    </div>
  );
}

export default App;
