import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="p-6">
      <nav className="mb-6 space-x-4">
        <Link to="/">Accueil</Link>
        <Link to="/cartographie">Cartographie</Link>
        <Link to="/processus">Processus</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/cartographie" element={<Cartographie />} />
        <Route path="/processus" element={<Processus />} />
      </Routes>
    </div>
  );
}

// Pages de test simples
function Accueil() {
  return <h1 className="text-2xl font-bold">Page d'accueil</h1>;
}

function Cartographie() {
  return <h1 className="text-2xl font-bold">Vue Cartographie</h1>;
}

function Processus() {
  return <h1 className="text-2xl font-bold">Vue Processus</h1>;
}

export default App;
