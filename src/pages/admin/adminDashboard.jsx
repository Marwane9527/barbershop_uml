import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [service, setService] = useState({ nom: "", prix: "", duree: "" });
  const [message, setMessage] = useState("");
  const [services, setServices] = useState([]);
  const [editingServiceId, setEditingServiceId] = useState(null);

  useEffect(() => {
    if (activeTab === "users") fetchUtilisateurs();
    if (activeTab === "services") fetchServices();
  }, [activeTab]);

  const fetchUtilisateurs = async () => {
    const { data, error } = await supabase.from("utilisateurs").select("*");
    if (!error) setUtilisateurs(data);
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("date_creation", { ascending: false });

    if (!error) setServices(data);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;

    const { error } = await supabase.from("utilisateurs").delete().eq("id", userId);
    if (!error) {
      setUtilisateurs((prev) => prev.filter((u) => u.id !== userId));
    } else {
      alert("Erreur : " + error.message);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
  const { error } = await supabase
    .from("utilisateurs")
    .update({ role: newRole })
    .eq("id", userId);

  if (!error) {
    setUtilisateurs((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  } else {
    alert("Erreur lors du changement de rôle.");
    console.error(error.message);
  }
};


  const handleCreateOrUpdateService = async () => {
    if (!service.nom || !service.prix || !service.duree) {
      setMessage("Tous les champs sont obligatoires.");
      return;
    }

    if (editingServiceId) {
      const { error } = await supabase
        .from("services")
        .update({
          nom: service.nom,
          prix: parseFloat(service.prix),
          duree: parseInt(service.duree),
        })
        .eq("id", editingServiceId);

      if (!error) {
        setMessage("✅ Service modifié !");
        setEditingServiceId(null);
      } else {
        setMessage("Erreur modification : " + error.message);
      }
    } else {
      const { error } = await supabase.from("services").insert([
        {
          nom: service.nom,
          prix: parseFloat(service.prix),
          duree: parseInt(service.duree),
        },
      ]);

      if (!error) {
        setMessage("✅ Service ajouté !");
      } else {
        setMessage("Erreur création : " + error.message);
      }
    }

    setService({ nom: "", prix: "", duree: "" });
    fetchServices();
  };

  const handleEditService = (s) => {
    setService({
      nom: s.nom,
      prix: s.prix.toString(),
      duree: s.duree.toString(),
    });
    setEditingServiceId(s.id);
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Supprimer ce service ?")) return;

    const { error } = await supabase.from("services").delete().eq("id", id);
    if (!error) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert("Erreur : " + error.message);
    }
  };

  return (
    <div className="container text-center">
      <h2 className="mb-4">Panel Administrateur</h2>

      {!activeTab && (
        <div className="d-flex justify-content-center gap-3">
          <button className="btn btn-primary btn-lg" onClick={() => setActiveTab("users")}>
            Gérer les utilisateurs
          </button>
          <button className="btn btn-success btn-lg" onClick={() => setActiveTab("services")}>
            Gérer les services
          </button>
        </div>
      )}

      {activeTab && (
        <div className="text-start mt-4">
          <button className="btn btn-outline-secondary mb-4" onClick={() => setActiveTab(null)}>
            ← Retour
          </button>
        </div>
      )}

      {/* UTILISATEURS */}
{activeTab === "users" && (
  <div className="mt-3">
    <h4 className="mb-3">Liste des utilisateurs</h4>
    <table className="table table-bordered table-hover table-sm">
      <thead className="table-dark">
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>Créé le</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {utilisateurs.map((u) => (
          <tr key={u.id}>
            <td>{u.nom_complet || "-"}</td>
            <td>{u.email}</td>
            <td>
              <select
                className="form-select form-select-sm"
                value={u.role}
                onChange={(e) => handleChangeRole(u.id, e.target.value)}
              >
                <option value="client">Client</option>
                <option value="coiffeur">Coiffeur</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td>{new Date(u.date_creation).toLocaleDateString()}</td>
            <td>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteUser(u.id)}
              >
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


      {/* SERVICES */}
      {activeTab === "services" && (
        <div className="mt-3 col-md-8 mx-auto text-start">
          <h4>{editingServiceId ? "Modifier le service" : "Ajouter un service"}</h4>

          <div className="mb-3">
            <label className="form-label">Nom</label>
            <input
              className="form-control"
              value={service.nom}
              onChange={(e) => setService({ ...service, nom: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Prix (€)</label>
            <input
              type="number"
              className="form-control"
              value={service.prix}
              onChange={(e) => setService({ ...service, prix: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Durée (min)</label>
            <input
              type="number"
              className="form-control"
              value={service.duree}
              onChange={(e) => setService({ ...service, duree: e.target.value })}
            />
          </div>

          <button className="btn btn-success w-100" onClick={handleCreateOrUpdateService}>
            {editingServiceId ? "Mettre à jour" : "Enregistrer le service"}
          </button>

          {message && <div className="alert alert-info mt-3">{message}</div>}

          <hr className="my-4" />

          <h5>Services enregistrés</h5>
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prix</th>
                <th>Durée</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>{s.nom}</td>
                  <td>{s.prix}€</td>
                  <td>{s.duree} min</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditService(s)}>
                      Modifier
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteService(s.id)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
