import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

function App() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const email = user?.email ?? "";
      const allowedDomain = "@jinnov-insa.fr";

      if (user && email.endsWith(allowedDomain)) {
        setUser(user);
      } else {
        if (user) {
          alert("Accès réservé aux comptes @jinnov-insa.fr");
        }
        auth.signOut();
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return <p className="p-6">Chargement...</p>;
  }

  if (!user) {
    return (
      <div className="p-6">
        <button
          onClick={login}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Connexion avec Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>Bonjour {user.displayName} ({user.email})</div>
        <button onClick={logout} className="text-sm underline text-blue-600">
          Déconnexion
        </button>
      </div>

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
