import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, provider, db } from "./firebase";
import Utilisateurs from "./pages/utilisateurs";

const ALLOWED_DOMAIN = "@jinnov-insa.fr";
const DEFAULT_ADMIN = "augustin.zahorka@jinnov-insa.fr";

type UserRole = "admin" | "editor" | null;

interface AppUser {
  email: string;
  displayName: string;
  role: UserRole;
}

function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erreur auth :", error);
    }
  };

  const logout = () => {
    auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCheckingAuth(false);
        return;
      }

      const email = firebaseUser.email ?? "";

      if (!email.endsWith(ALLOWED_DOMAIN)) {
        alert("Accès refusé.");
        auth.signOut();
        setCheckingAuth(false);
        return;
      }

      const userRef = doc(db, "users", email);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        if (email === DEFAULT_ADMIN) {
          setUser({ email, displayName: firebaseUser.displayName ?? "", role: "admin" });
        } else {
          alert("Tu n'es pas autorisé à accéder à cette application.");
          auth.signOut();
        }
      } else {
        const data = userSnap.data();
        setUser({
          email: data.email,
          displayName: data.displayName ?? firebaseUser.displayName ?? "",
          role: data.role ?? null,
        });
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) return <p className="p-6">Chargement...</p>;

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
        <div>
          Bonjour {user.displayName} ({user.email}) —{" "}
          <span className="italic text-gray-500">
            {user.role ?? "lecteur"}
          </span>
        </div>
        <button onClick={logout} className="text-sm underline text-blue-600">
          Déconnexion
        </button>
      </div>

      <nav className="mb-6 space-x-4">
        <Link to="/">Accueil</Link>
        <Link to="/cartographie">Cartographie</Link>
        <Link to="/processus">Processus</Link>
        {user.role === "admin" && <Link to="/utilisateurs">Utilisateurs</Link>}
      </nav>

      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/cartographie" element={<Cartographie />} />
        <Route path="/processus" element={<Processus />} />
        <Route
          path="/utilisateurs"
          element={
            user.role === "admin" ? (
              <Utilisateurs currentUserEmail={user.email} />
            ) : (
              <div className="text-red-600 p-6">Accès refusé.</div>
            )
          }
        />
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
