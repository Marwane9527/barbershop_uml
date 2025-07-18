import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const ClientDashboard = () => {
  const [rdvs, setRdvs] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [editRdvId, setEditRdvId] = useState(null);
  const [editDateTime, setEditDateTime] = useState("");

  useEffect(() => {
    const getClientId = async () => {
      const { data: session } = await supabase.auth.getUser();
      const userId = session?.user?.id;
      if (!userId) return;
      setClientId(userId);
    };
    getClientId();
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchRendezVous();
    }
  }, [clientId]);

  const fetchRendezVous = async () => {
    const { data, error } = await supabase
      .from("rendez_vous")
      .select("id, date_heure, statut")
      .eq("client_id", clientId)
      .order("date_heure", { ascending: true });

    if (!error) {
      setRdvs(data);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("rendez_vous").delete().eq("id", id);
    if (!error) {
      setRdvs((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleEditClick = (rdv) => {
    setEditRdvId(rdv.id);
    setEditDateTime(new Date(rdv.date_heure).toISOString().slice(0, 16));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("rendez_vous")
      .update({
        date_heure: new Date(editDateTime).toISOString(),
        statut: "en_attente",
        date_mise_a_jour: new Date().toISOString(),
      })
      .eq("id", editRdvId);

    if (!error) {
      setEditRdvId(null);
      setEditDateTime("");
      fetchRendezVous();
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4">Mes Rendez-vous</h2>

      {rdvs.length === 0 ? (
        <div className="alert alert-info">Aucun rendez-vous trouvé.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Heure</th>
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

                return editRdvId === r.id ? (
                  <tr key={r.id}>
                    <td colSpan="4">
                      <form
                        className="d-flex flex-column flex-sm-row gap-2 align-items-start"
                        onSubmit={handleEditSubmit}
                      >
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={editDateTime}
                          onChange={(e) => setEditDateTime(e.target.value)}
                          required
                        />
                        <button type="submit" className="btn btn-success btn-sm">
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditRdvId(null)}
                        >
                          Annuler
                        </button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={r.id}>
                    <td>{jour}</td>
                    <td>{heure}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.statut === "en_attente"
                            ? "bg-warning text-dark"
                            : r.statut === "confirme"
                            ? "bg-success"
                            : r.statut === "annule"
                            ? "bg-danger"
                            : "bg-secondary"
                        }`}
                      >
                        {r.statut.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEditClick(r)}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(r.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
