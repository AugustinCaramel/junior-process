import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
  addDoc,
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
  const [newProcessNom, setNewProcessNom] = useState("");

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

  const creerEtAjouterProcessus = async () => {
    if (!newProcessId.trim() || !newProcessNom.trim()) return;
    await addDoc(collection(db, "processus"), {
      id: newProcessId,
      nom: newProcessNom,
      cartographiePrincipale: id,
      cartographiesUtiliseDans: [id],
    });
    const newIds = [...new Set([...processIds, newProcessId])];
    const snap = await getDocs(collection(db, "cartographies"));
    const docRef = snap.docs.find((d) => d.data().id === id);
    if (docRef) {
      await updateDoc(doc(db, "cartographies", docRef.id), {
        processusPrincipaux: newIds,
      });
    }
    setProcessIds(newIds);
    setNewProcessId("");
    setNewProcessNom("");
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
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Cartographie {id}</h1>
        <p className="text-gray-600 text-lg">{cartoNom}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Processus principaux</h2>
        <ul className="space-y-3">
          {processList.map((p) => (
            <li
              key={p.id}
              className="border p-4 rounded-2xl flex justify-between items-center bg-white shadow"
            >
              <span className="font-medium">
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

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Ajouter un processus existant</h2>
        <div className="flex gap-2">
          <input
            placeholder="ID du processus existant"
            value={newProcessId}
            onChange={(e) => setNewProcessId(e.target.value)}
            className="border px-4 py-2 rounded-2xl w-full"
          />
          <button
            onClick={ajouterProcessus}
            className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700"
          >
            Ajouter
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Créer et ajouter un processus</h2>
        <input
          placeholder="ID du nouveau processus"
          value={newProcessId}
          onChange={(e) => setNewProcessId(e.target.value)}
          className="border px-4 py-2 rounded-2xl w-full"
        />
        <input
          placeholder="Nom du processus"
          value={newProcessNom}
          onChange={(e) => setNewProcessNom(e.target.value)}
          className="border px-4 py-2 rounded-2xl w-full"
        />
        <button
          onClick={creerEtAjouterProcessus}
          className="bg-green-600 text-white px-4 py-2 rounded-2xl hover:bg-green-700 w-full"
        >
          Créer et ajouter
        </button>
      </div>
    </div>
  );
}