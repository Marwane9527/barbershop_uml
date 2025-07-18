import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const BarberDashboard = () => {
  const [rdvs, setRdvs] = useState([]);
  const [barberId, setBarberId] = useState(null);
  const [dispos, setDispos] = useState({});
  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  useEffect(() => {
    const getCoiffeur = async () => {
  const { data: session } = await supabase.auth.getUser();
  const userId = session?.user?.id;

  if (!userId) return;

  const { data: coiffeur } = await supabase
    .from("utilisateurs")
    .select("id")
    .eq("id", userId)
    .eq("role", "coiffeur")
    .single();

  if (coiffeur) {
    setBarberId(coiffeur.id);
  }
};


    getCoiffeur();
  }, []);

  useEffect(() => {
    if (barberId) {
      fetchRendezVous();
      fetchDispos();
    }
  }, [barberId]);

  const fetchRendezVous = async () => {
  const { data, error } = await supabase
    .from("rendez_vous")
    .select("id, date_heure, statut, service_id")
    .eq("coiffeur_id", barberId)
    .eq("statut", "en_attente")
    .order("date_heure", { ascending: true });

  if (!error) setRdvs(data);
};



  const fetchDispos = async () => {
    const { data, error } = await supabase
      .from("disponibilites_coiffeurs")
      .select("*")
      .eq("coiffeur_id", barberId);

    if (!error && data) {
      const mapped = {};
      data.forEach((d) => {
        mapped[d.jour_semaine] = d;
      });
      setDispos(mapped);
    }
  };

  const handleDispoChange = (jour, valeur) => {
    setDispos((prev) => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        jour_semaine: jour,
        coiffeur_id: barberId,
        est_disponible: valeur,
      },
    }));
  };

  const enregistrerDispos = async () => {
    for (let jour = 0; jour <= 6; jour++) {
      const dispo = dispos[jour];
      const data = {
        coiffeur_id: barberId,
        jour_semaine: jour,
        est_disponible: dispo?.est_disponible ?? false,
      };

      if (dispo?.id) {
        await supabase
          .from("disponibilites_coiffeurs")
          .update(data)
          .eq("id", dispo.id);
      } else {
        await supabase.from("disponibilites_coiffeurs").insert([data]);
      }
    }

    alert("Disponibilités mises à jour !");
    fetchDispos();
  };

  const updateStatut = async (id, statut) => {
    await supabase.from("rendez_vous").update({ statut }).eq("id", id);
    fetchRendezVous();
  };

  return (
    <div>
      <h2 className="mb-4">Tableau de bord Coiffeur</h2>

      <div className="mb-5">
        <h4>Mes jours de disponibilité</h4>
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              <th>Jour</th>
              <th>Disponible</th>
            </tr>
          </thead>
          <tbody>
            {jours.map((jourNom, i) => (
              <tr key={i}>
                <td>{jourNom}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={dispos[i]?.est_disponible ?? (i !== 1)} // fermé par défaut le lundi, car le barbe est ouvert de mardi à dimanche
                    onChange={(e) =>
                      handleDispoChange(i, e.target.checked)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-primary" onClick={enregistrerDispos}>
          Enregistrer mes disponibilités
        </button>
      </div>

      <h4 className="mt-5 mb-3">Mes Rendez-vous</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Heure</th>
            <th>Service ID</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rdvs.map((r) => {
            const date = new Date(r.date_heure);
            const jour = date.toLocaleDateString();
            const heure = date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <tr key={r.id}>
                <td>{jour}</td>
                <td>{heure}</td>
                <td>{r.service_id}</td>
                <td>
                  <span
                    className={`badge bg-${
                      r.statut === "confirme"
                        ? "success"
                        : r.statut === "annule"
                        ? "danger"
                        : r.statut === "termine"
                        ? "secondary"
                        : "warning"
                    }`}
                  >
                    {r.statut}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => updateStatut(r.id, "confirme")}
                  >
                    Confirmer
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => updateStatut(r.id, "annule")}
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BarberDashboard;
