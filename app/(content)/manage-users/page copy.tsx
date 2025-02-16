"use client";

import axios from "axios";
import { useState } from "react";

// Define the User type
type User = {
  id: number;
  name: string;
  lastname: string;
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

  // Create a new user
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create the new user object
    const newUser: User = {
      id: Date.now(), // Use a timestamp as a simple unique ID
      name,
      lastname,
      email,
      telephone,
    };

    try {
      // Get the accessToken from where it's stored (e.g., localStorage, sessionStorage, or state)
      const accessToken = localStorage.getItem("token"); // or sessionStorage, or from state

      if (!accessToken) {
        throw new Error("No access token found. Please log in again.");
      }

      // Send the request to the backend
      const response = await axios.post(
        "http://localhost:3005/users/me",
        {
          firstName: newUser.name,
          lastName: newUser.lastname,
          telephone: newUser.telephone,
          email: newUser.email,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Include the accessToken in the request
          },
        }
      );

      // If the request is successful, update the local state
      setUsers([...users, newUser]);
      resetForm();
      setActiveOperation(null);

      console.log("User created successfully:", response.data);
    } catch (error) {
      console.error("Error creating user:", error);
      // Handle the error (e.g., show a notification to the user)
    }
  };

  // Update an existing user
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId !== null) {
      const updatedUsers = users.map((user) =>
        user.id === selectedUserId
          ? { ...user, name, lastname, email, telephone }
          : user
      );
      
      setUsers(updatedUsers);
      resetForm();
      setSelectedUserId(null);
      setActiveOperation(null);
    }
  };

  // Delete a user
  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId !== null) {
      const filteredUsers = users.filter((user) => user.id !== selectedUserId);
      setUsers(filteredUsers);
      resetForm();
      setSelectedUserId(null);
      setActiveOperation(null);
    }
  };

  // Set the selected user for update/delete
  const selectUser = (user: User) => {
    setSelectedUserId(user.id);
    setName(user.name);
    setLastname(user.lastname);
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
                  {user.name} {user.lastname}
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
                  {user.name} {user.lastname}
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
                <td>{user.name}</td>
                <td>{user.lastname}</td>
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
