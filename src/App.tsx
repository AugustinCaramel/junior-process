import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, provider, db } from "./firebase";
import Utilisateurs from "./pages/utilisateurs";

const ALLOWED_DOMAIN = "@jinnov-insa.fr";
const DEFAULT_ADMIN = "augustin.zahorka@jinnov-insa.fr";

function App() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const login = async () => {
    try {
      signInWithPopup(auth, provider)
        .then((result) => {
          console.log("Connecté :", result.user.email);
        })
        .catch((error) => {
          console.error("Erreur auth :", error);
        });
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setCheckingAuth(false); // ✅ FIN DE L'ATTENTE
        return;
      }
  
      const email = user.email ?? "";
  
      if (!email.endsWith(ALLOWED_DOMAIN)) {
        alert("Accès refusé.");
        auth.signOut();
        setCheckingAuth(false); // ✅ FIN DE L'ATTENTE
        return;
      }
  
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        const role = email === DEFAULT_ADMIN ? "admin" : "viewer";
        await setDoc(userRef, {
          uid: user.uid,
          email,
          displayName: user.displayName,
          role,
        });
      }
  
      setUser(user);
      setCheckingAuth(false); // ✅ FIN DE L'ATTENTE
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
        <Link to="/utilisateurs">Utilisateurs</Link>

      </nav>

      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/cartographie" element={<Cartographie />} />
        <Route path="/processus" element={<Processus />} />
        <Route path="/utilisateurs" element={<Utilisateurs />} />
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
