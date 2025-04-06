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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cartographies</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border px-2 py-1 rounded"
          placeholder="ID (ex: C001)"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
        />
        <input
          className="border px-2 py-1 rounded flex-1"
          placeholder="Nom de la cartographie"
          value={newNom}
          onChange={(e) => setNewNom(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded"
          onClick={ajouterCartographie}
        >
          Ajouter
        </button>
      </div>

      <ul className="space-y-2">
        {cartographies.map((c) => (
          <li
            key={c.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <Link to={`/cartographie/${c.id}`} className="font-medium">
              [{c.id}] {c.nom}
            </Link>
            <button
              onClick={() => supprimerCartographie(c.id)}
              className="text-red-600 text-sm underline"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
