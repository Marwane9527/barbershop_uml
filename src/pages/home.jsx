import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Home = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [services, setServices] = useState([]);
  const [coiffeurs, setCoiffeurs] = useState([]);

  useEffect(() => {
    checkUserRole();
    fetchServices();
    fetchCoiffeurs();
  }, []);

  const checkUserRole = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) return;

    const { data: profil, error } = await supabase
      .from("utilisateurs")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!error && profil?.role) {
      setUserRole(profil.role);
    }
  };

  const fetchServices = async () => {
    const { data, error } = await supabase.from("services").select("*");
    if (!error) {
      setServices(data);
    } else {
      console.error("Erreur de chargement des services :", error.message);
    }
  };

  const fetchCoiffeurs = async () => {
    const { data, error } = await supabase
      .from("utilisateurs")
      .select("id, nom_complet, email, url_avatar")
      .eq("role", "coiffeur");

    if (!error) {
      setCoiffeurs(data);
    } else {
      console.error("Erreur de chargement des coiffeurs :", error.message);
    }
  };

  return (
    <div className="container mt-4">
      <div className="text-center py-5 bg-light rounded">
        <h1 className="display-4">Bienvenue chez Barbershop</h1>
        <p className="lead">Prenez rendez-vous avec nos meilleurs coiffeurs</p>
        <div className="mt-4 d-flex justify-content-center gap-2 flex-wrap">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/booking")}
          >
            Réserver maintenant
          </button>

          {userRole === "admin" && (
            <button
              className="btn btn-danger btn-lg"
              onClick={() => navigate("/admin")}
            >
              Tableau Admin
            </button>
          )}
        </div>
      </div>

      <h3 className="text-center mt-5 mb-4">Nos Services</h3>
      <div className="row">
        {services.map((s) => (
          <div className="col-md-4 mb-4" key={s.id}>
            <div className="card h-100 shadow">
              <div className="card-body">
                <h5 className="card-title">{s.nom}</h5>
                <p className="card-text">
                  {s.description || "Description à venir..."}<br />
                  <strong>Prix :</strong> {s.prix} €<br />
                  <strong>Durée :</strong> {s.duree} min
                </p>
              </div>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-12 text-center text-muted">
            Aucun service enregistré pour le moment.
          </div>
        )}
      </div>



      <h3 className="text-center mt-5 mb-4">Nos Coiffeurs</h3>
      <div className="row">
        {coiffeurs.map((c) => (
          <div className="col-md-4 mb-4" key={c.id}>
            <div className="card h-100 text-center shadow">
              <div className="card-body">
                <h5 className="card-title">{c.nom_complet}</h5>
                <p className="card-text">{c.email}</p>
              </div>
            </div>
          </div>
        ))}

        {coiffeurs.length === 0 && (
          <div className="col-12 text-center text-muted">
            Aucun coiffeur enregistré pour le moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
