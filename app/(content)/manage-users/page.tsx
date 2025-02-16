"use client";

import { useState, useEffect } from "react";
import axios from "axios";

// Define the User type
type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
};

export default function CRUDPage() {
  // State for managing users
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telephone, setTelephone] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeOperation, setActiveOperation] = useState<
    "create" | "update" | "delete" | null
  >(null);

  // Fetch users from the backend on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No access token found. Please log in again.");
        }

        const response = await axios.get("http://localhost:3005/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Assuming the response data is an array of users
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Create a new user
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const newUser: User = {
      id: Date.now(), // Use a timestamp as a simple unique ID
      firstName: name,
      lastName: lastname,
      email,
      telephone,
    };

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No access token found. Please log in again.");
      }

      const response = await axios.post(
        "http://localhost:3005/users/me",
        {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          telephone: newUser.telephone,
          email: newUser.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers([...users, newUser]);
      resetForm();
      setActiveOperation(null);

      console.log("User created successfully:", response.data);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Update an existing user
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUserId !== null) {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No access token found. Please log in again.");
        }

        // Prepare the updated user data
        const updatedUser = {
          firstName: name,
          lastName: lastname,
          telephone,
          email,
        };

        // Send the PATCH request to the backend
        const response = await axios.patch(
          `http://localhost:3005/users/me/${selectedUserId}`,
          updatedUser,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // If the request is successful, update the local state
        const updatedUsers = users.map((user) =>
          user.id === selectedUserId ? { ...user, ...updatedUser } : user
        );
        setUsers(updatedUsers);
        resetForm();
        setSelectedUserId(null);
        setActiveOperation(null);

        console.log("User updated successfully:", response.data);
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  };

  // Delete a user
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUserId !== null) {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No access token found. Please log in again.");
        }

        const response = await axios.delete(
          `http://localhost:3005/users/me/${selectedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const filteredUsers = users.filter(
          (user) => user.id !== selectedUserId
        );
        setUsers(filteredUsers);
        resetForm();
        setSelectedUserId(null);
        setActiveOperation(null);

        console.log("User deleted successfully:", response.data);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // Set the selected user for update/delete
  const selectUser = (user: User) => {
    setSelectedUserId(user.id);
    setName(user.firstName);
    setLastname(user.lastName);
    setEmail(user.email);
    setTelephone(user.telephone);
  };

  // Reset the form fields
  const resetForm = () => {
    setName("");
    setLastname("");
    setEmail("");
    setTelephone("");
  };

  return (
    <div>
      <h1>User Management</h1>

      {/* Buttons for CRUD operations */}
      <button onClick={() => setActiveOperation("create")}>Create User</button>
      <button onClick={() => setActiveOperation("update")}>Update User</button>
      <button onClick={() => setActiveOperation("delete")}>Delete User</button>

      {/* Create User Form */}
      {activeOperation === "create" && (
        <div>
          <h2>Create User</h2>
          <form onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Lastname"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Telephone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              required
            />
            <button type="submit">Create</button>
          </form>
        </div>
      )}

      {/* Update User Form */}
      {activeOperation === "update" && (
        <div>
          <h2>Update User</h2>
          <form onSubmit={handleUpdate}>
            <select
              value={selectedUserId || ""}
              onChange={(e) => {
                const userId = parseInt(e.target.value, 10);
                const user = users.find((u) => u.id === userId);
                if (user) selectUser(user);
              }}
              required
            >
              <option value="" disabled>
                Select a user
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Lastname"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Telephone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              required
            />
            <button type="submit">Update</button>
          </form>
        </div>
      )}

      {/* Delete User Form */}
      {activeOperation === "delete" && (
        <div>
          <h2>Delete User</h2>
          <form onSubmit={handleDelete}>
            <select
              value={selectedUserId || ""}
              onChange={(e) => {
                const userId = parseInt(e.target.value, 10);
                const user = users.find((u) => u.id === userId);
                if (user) selectUser(user);
              }}
              required
            >
              <option value="" disabled>
                Select a user
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
            <button type="submit">Delete</button>
          </form>
        </div>
      )}

      {/* Display Users in a Table */}
      <div>
        <h2>User List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Lastname</th>
              <th>Email</th>
              <th>Telephone</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.telephone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
