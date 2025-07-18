import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Avis = () => {
  const [user, setUser] = useState(null);
  const [avisList, setAvisList] = useState([]);
  const [form, setForm] = useState({ note: "", commentaire: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkUser();
    fetchAvis();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  };

  const fetchAvis = async () => {
    const { data, error } = await supabase
      .from("avis")
      .select("note, commentaire, date_creation, utilisateur:utilisateur_id (nom_complet)")
      .order("date_creation", { ascending: false });

    if (!error) setAvisList(data || []);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setMessage("");

    if (!user) return setMessage("Vous devez être connecté pour laisser un avis.");
    if (!form.note || !form.commentaire)
      return setMessage("Tous les champs sont obligatoires.");

    const { error } = await supabase.from("avis").insert([
      {
        utilisateur_id: user.id,
        note: parseInt(form.note),
        commentaire: form.commentaire,
      },
    ]);

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("✅ Merci pour votre avis !");
      setForm({ note: "", commentaire: "" });
      fetchAvis();
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Laisser un avis sur notre salon</h2>

      {user ? (
        <div className="card p-4 mb-4 shadow-sm">
          <div className="mb-3">
            <label className="form-label">Note (1 à 5)</label>
            <select
              className="form-select"
              name="note"
              value={form.note}
              onChange={handleChange}
            >
              <option value="">-- Sélectionner --</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Commentaire</label>
            <textarea
              name="commentaire"
              className="form-control"
              rows="3"
              value={form.commentaire}
              onChange={handleChange}
            ></textarea>
          </div>

          <button className="btn btn-primary w-100" onClick={handleSubmit}>
            Envoyer l'avis
          </button>

          {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>
      ) : (
        <div className="alert alert-warning text-center">
          Vous devez être connecté pour déposer un avis.
        </div>
      )}

      <h4 className="mt-5 mb-3">Avis des clients</h4>
      {avisList.length === 0 ? (
        <p>Aucun avis pour le moment.</p>
      ) : (
        avisList.map((avis, index) => (
          <div key={index} className="border rounded p-3 mb-3 bg-light">
            <div className="d-flex justify-content-between">
              <strong>{avis.utilisateur?.nom_complet || "Client anonyme"}</strong>
              <span className="badge bg-warning text-dark">Note : {avis.note}/5</span>
            </div>
            <p className="mt-2 mb-0">{avis.commentaire}</p>
            <small className="text-muted">
              {new Date(avis.date_creation).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
};

export default Avis;
