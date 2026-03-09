import { useEffect, useState } from "react";
import { getEvents } from "../api/events";
import { getPersonalities } from "../api/personalities";
import { getAllUsers } from "../api/users";
import AdminEvents from "./AdminEvents";
import AdminPersonalities from "./AdminPersonalities";
import AdminUsers from "./AdminUsers";

// ─── Icônes SVG ───────────────────────────────────────────────────────────────

const IconCalendar = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const IconPerson = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconUsers = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// ─── Configuration des onglets ────────────────────────────────────────────────

const TABS = [
  { key: "events", label: "Events", icon: <IconCalendar /> },
  { key: "personalities", label: "Personalities", icon: <IconPerson /> },
  { key: "users", label: "Users", icon: <IconUsers /> },
];

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * Page d'administration — shell avec sidebar et onglets
 * Délègue le contenu à AdminEvents, AdminPersonalities ou AdminUsers
 * selon l'onglet actif
 */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("events");

  // Compteurs affichés dans les badges de la sidebar
  // Mis à jour au montage (pré-chargement) et par chaque sous-composant via onCountChange
  const [counts, setCounts] = useState({
    events: 0,
    personalities: 0,
    users: 0,
  });

  // Pré-charge les compteurs au montage pour afficher les badges immédiatement
  useEffect(() => {
    getEvents()
      .then((d) => setCounts((c) => ({ ...c, events: d.length })))
      .catch(() => {});
    getPersonalities()
      .then((d) => setCounts((c) => ({ ...c, personalities: d.length })))
      .catch(() => {});
    getAllUsers()
      .then((d) => setCounts((c) => ({ ...c, users: d.length })))
      .catch(() => {});
  }, []);

  /**
   * Retourne un callback de mise à jour du compteur pour une clé donnée
   * Passé aux sous-composants via la prop onCountChange
   * @param {"events"|"personalities"|"users"} key
   */
  function setCount(key) {
    return (n) => setCounts((c) => ({ ...c, [key]: n }));
  }

  return (
    <div className="admin-layout page-fade">
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-label">Admin</span>
          <h1 className="admin-sidebar-title">Dashboard</h1>
        </div>

        <nav className="admin-nav">
          <p className="admin-nav-section">Content</p>
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`admin-nav-item ${activeTab === key ? "admin-nav-item--active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <span className="admin-nav-icon">{icon}</span>
              <span className="admin-nav-label">{label}</span>
              {/* Badge avec le nombre d'éléments dans chaque section */}
              <span className="admin-nav-count">{counts[key]}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <p className="admin-sidebar-footer-text">Level History</p>
        </div>
      </aside>

      {/* ── Contenu principal selon l'onglet actif ────────────────────────────── */}
      <main className="admin-main">
        {activeTab === "events" && (
          <AdminEvents onCountChange={setCount("events")} />
        )}
        {activeTab === "personalities" && (
          <AdminPersonalities onCountChange={setCount("personalities")} />
        )}
        {activeTab === "users" && (
          <AdminUsers onCountChange={setCount("users")} />
        )}
      </main>
    </div>
  );
}
