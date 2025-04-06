import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

type UserRole = "admin" | "editor" | "viewer";

interface UserEntry {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export default function Utilisateurs() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("viewer");

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
        setCurrentUserRole((current.data() as UserEntry).role);
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

  if (currentUserRole !== "admin") {
    return <div className="p-6 text-red-600">Accès réservé aux administrateurs.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th>Email</th>
            <th>Nom</th>
            <th>Rôle</th>
            <th>Modifier</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.uid} className="border-t">
              <td>{u.email}</td>
              <td>{u.displayName}</td>
              <td>{u.role}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.uid, e.target.value as UserRole)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="viewer">Lecteur</option>
                  <option value="editor">Modificateur</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
