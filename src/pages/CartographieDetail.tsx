import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { db } from "../firebase";

interface Processus {
  id: string;
  nom: string;
}

export default function CartographieDetail() {
  const { id } = useParams();
  const [cartoNom, setCartoNom] = useState("");
  const [processIds, setProcessIds] = useState<string[]>([]);
  const [processList, setProcessList] = useState<Processus[]>([]);
  const [newProcessId, setNewProcessId] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "cartographies"));
      const docSnap = snap.docs.find((d) => d.data().id === id);
      if (!docSnap) return;
      const data = docSnap.data();
      setCartoNom(data.nom);
      setProcessIds(data.processusPrincipaux || []);
    };
    fetch();
  }, [id]);

  useEffect(() => {
    const fetchProcessus = async () => {
      const all = await getDocs(collection(db, "processus"));
      const processFiltered: Processus[] = [];
      all.forEach((d) => {
        const data = d.data();
        if (processIds.includes(data.id)) {
          processFiltered.push({ id: data.id, nom: data.nom });
        }
      });
      setProcessList(processFiltered);
    };
    if (processIds.length > 0) fetchProcessus();
  }, [processIds]);

  const ajouterProcessus = async () => {
    if (!newProcessId.trim()) return;

    const snap = await getDocs(collection(db, "cartographies"));
    const docRef = snap.docs.find((d) => d.data().id === id);
    if (!docRef) return;

    const newIds = [...new Set([...processIds, newProcessId])];
    await updateDoc(doc(db, "cartographies", docRef.id), {
      processusPrincipaux: newIds,
    });
    setProcessIds(newIds);
    setNewProcessId("");
  };

  const retirerProcessus = async (pid: string) => {
    const snap = await getDocs(collection(db, "cartographies"));
    const docRef = snap.docs.find((d) => d.data().id === id);
    if (!docRef) return;

    const newIds = processIds.filter((p) => p !== pid);
    await updateDoc(doc(db, "cartographies", docRef.id), {
      processusPrincipaux: newIds,
    });
    setProcessIds(newIds);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cartographie {id}</h1>
      <p className="mb-4 text-gray-600">{cartoNom}</p>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Processus principaux</h2>
        <ul className="space-y-2">
          {processList.map((p) => (
            <li
              key={p.id}
              className="border p-2 rounded flex justify-between items-center"
            >
              <span>
                [{p.id}] {p.nom}
              </span>
              <button
                onClick={() => retirerProcessus(p.id)}
                className="text-red-600 text-sm underline"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <input
          placeholder="ID du processus (ex: P001)"
          value={newProcessId}
          onChange={(e) => setNewProcessId(e.target.value)}
          className="border px-2 py-1 rounded flex-1"
        />
        <button
          onClick={ajouterProcessus}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}