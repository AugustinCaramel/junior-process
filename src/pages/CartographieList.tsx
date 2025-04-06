import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

interface Cartographie {
  id: string;
  nom: string;
  processusPrincipaux: string[];
}

export default function CartographieList() {
  const [cartographies, setCartographies] = useState<Cartographie[]>([]);
  const [newId, setNewId] = useState("");
  const [newNom, setNewNom] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "cartographies"));
      const list: Cartographie[] = [];
      snap.forEach((doc) => list.push(doc.data() as Cartographie));
      setCartographies(list);
    };
    fetch();
  }, []);

  const ajouterCartographie = async () => {
    if (!newId || !newNom) return;
    await addDoc(collection(db, "cartographies"), {
      id: newId,
      nom: newNom,
      processusPrincipaux: [],
    });
    setCartographies((prev) => [
      ...prev,
      { id: newId, nom: newNom, processusPrincipaux: [] },
    ]);
    setNewId("");
    setNewNom("");
  };

  const supprimerCartographie = async (id: string) => {
    const toDelete = cartographies.find((c) => c.id === id);
    if (!toDelete) return;
    const snapshot = await getDocs(collection(db, "cartographies"));
    const docId = snapshot.docs.find((d) => d.data().id === id)?.id;
    if (docId) {
      await deleteDoc(doc(db, "cartographies", docId));
      setCartographies((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start p-6">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold mb-2">Cartographies</h1>
        <p className="text-gray-600">Crée et gère les cartographies de l'application</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Ajouter une cartographie</h2>
        <div className="flex gap-2">
          <input
            className="border px-4 py-2 rounded-2xl w-1/3"
            placeholder="ID (ex: C001)"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
          />
          <input
            className="border px-4 py-2 rounded-2xl flex-1"
            placeholder="Nom de la cartographie"
            value={newNom}
            onChange={(e) => setNewNom(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700"
            onClick={ajouterCartographie}
          >
            Ajouter
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {cartographies.map((c) => (
          <div
            key={c.id}
            className="border p-4 rounded-2xl flex justify-between items-center bg-white shadow"
          >
            <Link
              to={`/cartographie/${c.id}`}
              className="font-medium text-blue-700 hover:underline"
            >
              [{c.id}] {c.nom}
            </Link>
            <button
              onClick={() => supprimerCartographie(c.id)}
              className="text-red-600 text-sm underline"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}