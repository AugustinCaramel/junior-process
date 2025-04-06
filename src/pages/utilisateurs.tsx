import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

type UserRole = "admin" | "editor";

interface UserEntry {
  email: string;
  displayName?: string;
  role: UserRole;
}

interface Props {
  currentUserEmail: string;
}

export default function Utilisateurs({ currentUserEmail }: Props) {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("editor");

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const list: UserEntry[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as UserEntry));
      setUsers(list);
    };
    fetchUsers();
  }, []);

  const addUser = async () => {
    const email = newEmail.trim().toLowerCase();

    if (!email.endsWith("@jinnov-insa.fr")) {
      alert("L'adresse doit être un email jinnov-insa.fr");
      return;
    }

    await setDoc(doc(db, "users", email), {
      email,
      role: newRole,
    });

    setUsers((prev) => [...prev, { email, role: newRole }]);
    setNewEmail("");
  };

  const updateUserRole = async (email: string, role: UserRole) => {
    await setDoc(doc(db, "users", email), { role, email }, { merge: true });
    setUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, role } : u))
    );
  };

  const deleteUser = async (email: string) => {
    if (email === currentUserEmail) {
      alert("Tu ne peux pas te supprimer toi-même.");
      return;
    }

    if (confirm("Supprimer cet utilisateur ?")) {
      await deleteDoc(doc(db, "users", email));
      setUsers((prev) => prev.filter((u) => u.email !== email));
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="email"
          placeholder="email@jinnov-insa.fr"
          className="border rounded px-2 py-1 flex-1"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as UserRole)}
          className="border rounded px-2 py-1"
        >
          <option value="editor">Éditeur</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={addUser}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Ajouter
        </button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.email} className="border-t">
              <td>{u.email}</td>
              <td>
                {u.email === currentUserEmail ? (
                  <span className="italic text-gray-500">non modifiable</span>
                ) : (
                  <select
                    value={u.role}
                    onChange={(e) =>
                      updateUserRole(u.email, e.target.value as UserRole)
                    }
                    className="border px-2 py-1 rounded"
                  >
                    <option value="editor">Éditeur</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </td>
              <td>
                {u.email !== currentUserEmail && (
                  <button
                    onClick={() => deleteUser(u.email)}
                    className="text-red-600 underline text-sm"
                  >
                    Supprimer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
