import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ProcessusDetail() {
  const { id } = useParams();
  const [nom, setNom] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "processus", id!));
      if (snap.exists()) {
        setNom(snap.data().nom);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const enregistrer = async () => {
    if (!id) return;
    await updateDoc(doc(db, "processus", id), { nom });
    setIsEditing(false);
  };

  if (loading) return <p className="p-6">Chargement...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Processus {id}</h1>
      {isEditing ? (
        <div className="space-y-2">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="border px-3 py-1 rounded w-full"
          />
          <button
            onClick={enregistrer}
            className="bg-green-600 text-white px-4 py-1 rounded"
          >
            Enregistrer
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-lg">{nom}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm underline text-blue-600"
          >
            Modifier
          </button>
        </div>
      )}
    </div>
  );
}
