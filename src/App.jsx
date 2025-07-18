import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/adminDashboard";
import BarberDashboard from "./pages/BarberDashboard";
import CreateAdmin from "./pages/CreateAdmin";
import { supabase } from "./supabaseClient";
import Avis from "./pages/avis";
import Horaires from "./pages/horaires";
import MesRendezVous from "./pages/mesrendezvous";



function App() {
  const [connected, setConnected] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (user) {
        setConnected(true);

        // récupère le rôle depuis la table utilisateurs
        const { data: profil, error } = await supabase
          .from("utilisateurs")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!error && profil) {
          setRole(profil.role);
        }
      } else {
        setConnected(false);
        setRole(null);
      }
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // simple pour rafraîchir l’état
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">Barbershop</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">

              <li className="nav-item">
                <Link className="nav-link" to="/">Accueil</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/booking">Réserver</Link>
              </li>
              <li className="nav-item">
  <Link className="nav-link" to="/avis">Avis</Link>
</li>

<li className="nav-item">
  <Link className="nav-link" to="/horaires">Horaires</Link>
</li>


              {role === "admin" && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">Tableau Admin</Link>
                </li>
              )}

              {role === "coiffeur" && (
                <li className="nav-item">
                  <Link className="nav-link" to="/barber">Mon Planning</Link>
                </li>
              )}

              {role === "client" && (
                <li className="nav-item">
                  <Link className="nav-link" to="/mes-rendez-vous">
      Mes rendez-vous
    </Link>
                </li>
              )}
              

              {!connected && (
                <li className="nav-item">
                  <Link className="nav-link" to="/auth">Connexion</Link>
                </li>
              )}

              {connected && (
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
                    Déconnexion
                  </button>
                </li>
              )}

            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/barber" element={<BarberDashboard />} />
          <Route path="/create-admin" element={<CreateAdmin />} />
          <Route path="/avis" element={<Avis />} />
          <Route path="/horaires" element={<Horaires />} />
          <Route path="/mes-rendez-vous" element={<MesRendezVous />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
