import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";

type UserRole = "admin" | "editor";

interface UserEntry {
  uid: string;
  email: string;
  displayName: string;
  role?: UserRole; // undefined = lecteur
}

export default function Utilisateurs() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const list: UserEntry[] = [];

      snapshot.forEach((doc) => {
        list.push(doc.data() as UserEntry);
      });

      setUsers(list);

      const current = snapshot.docs.find((d) => d.id === auth.currentUser?.uid);
      if (current) {
        const role = (current.data() as UserEntry).role;
        setCurrentUserRole(role ?? null);
      }
    };

    fetchUsers();
  }, []);

  const updateRole = async (uid: string, newRole: UserRole) => {
    await updateDoc(doc(db, "users", uid), {
      role: newRole,
    });

    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
    );
  };

  const deleteUser = async (uid: string) => {
    if (confirm("Supprimer cet utilisateur ?")) {
      await deleteDoc(doc(db, "users", uid));
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    }
  };

  if (currentUserRole !== "admin") {
    return (
      <div className="p-6 text-red-600">
        Accès réservé aux administrateurs.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2">Email</th>
            <th className="py-2">Nom</th>
            <th className="py-2">Rôle</th>
            <th className="py-2">Modifier le rôle</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.uid === auth.currentUser?.uid;

            return (
              <tr key={u.uid} className="border-t">
                <td className="py-2">{u.email}</td>
                <td className="py-2">{u.displayName}</td>
                <td className="py-2">{u.role ?? "lecteur"}</td>
                <td className="py-2">
                  {!isSelf ? (
                    <select
                      value={u.role ?? ""}
                      onChange={(e) =>
                        updateRole(u.uid, e.target.value as UserRole)
                      }
                      className="border px-2 py-1 rounded"
                    >
                      <option value="editor">Éditeur</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className="italic text-gray-500">
                      non modifiable
                    </span>
                  )}
                </td>
                <td className="py-2">
                  {!isSelf && (
                    <button
                      onClick={() => deleteUser(u.uid)}
                      className="text-red-600 underline text-sm"
                    >
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
