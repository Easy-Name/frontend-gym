"use client";

import { Search } from "lucide-react";
import { useRef, useState, CSSProperties } from "react";
import "./SearchUser.css"; // Make sure to create this CSS file

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
};

interface SearchUserProps {
  users: User[];
  onUserSelect: (user: User) => void;
}

export default function SearchUser({ users, onUserSelect }: SearchUserProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const styles: Record<string, CSSProperties> = {
    searchContainer: {
      position: "relative",
      marginBottom: "2rem",
      width: "100%",
      zIndex: 50,
    },
    searchInput: {
      padding: "0.75rem 2.5rem 0.75rem 1rem",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      width: "100%",
      fontSize: "1rem",
      backgroundColor: "white",
    },
    searchIcon: {
      position: "absolute",
      right: "1rem",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#64748b",
    },
    dropdownContainer: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      maxHeight: "200px",
      overflowY: "auto",
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      zIndex: 51,
    },
    dropdownItem: {
      padding: "0.75rem 1rem",
      cursor: "pointer",
      transition: "background-color 0.2s",
      backgroundColor: "white",
    },
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredUsers(isSearchFocused ? users : []);
      return;
    }
    const filtered = users.filter(
        (user) =>
            `${user.firstName} ${user.lastName}`
                .toLowerCase()
                .includes(term.toLowerCase()) ||
            user.email.toLowerCase().includes(term.toLowerCase()) ||
            user.telephone.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsSearchFocused(false);
        if (searchTerm === "") {
          setFilteredUsers([]);
        }
      }
    }, 200);
  };

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setSearchTerm(`${user.firstName} ${user.lastName}`);
    setFilteredUsers([]);
  };

  return (
      <div style={styles.searchContainer}>
        <input
            style={styles.searchInput}
            placeholder="Pesquisar aluno..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              setIsSearchFocused(true);
              if (searchTerm === "") {
                setFilteredUsers(users);
              }
            }}
            onBlur={handleBlur}
            autoComplete="off"
        />
        <Search size={20} style={styles.searchIcon} />
        {filteredUsers.length > 0 && (
            <div style={styles.dropdownContainer} ref={dropdownRef}>
              {filteredUsers.map((user) => (
                  <div
                      key={user.id}
                      className="dropdown-item"
                      style={styles.dropdownItem}
                      onClick={() => handleUserSelect(user)}
                  >
                    {`${user.firstName} ${user.lastName} - ${user.email}`}
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}
