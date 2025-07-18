import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const CreateAdmin = () => {
  const [status, setStatus] = useState("");

  const handleCreate = async () => {
    setStatus("Création en cours...");

    const { data, error } = await supabase.auth.signUp({
      email: "marwane.merezak.pro@gmail.com",
      password: "azerty01",
    });

    if (error) {
      setStatus("Erreur auth : " + error.message);
      return;
    }

    const user = data?.user;

    const { error: insertError } = await supabase.from("utilisateurs").insert([
      {
        id: user.id,
        email: user.email,
        nom_complet: "Administrateur",
        role: "admin",
        url_avatar: "https://ui-avatars.com/api/?name=Admin+Barber",
      },
    ]);

    if (insertError) {
      setStatus("Erreur insertion utilisateur : " + insertError.message);
    } else {
      setStatus("✅ Administrateur créé avec succès !");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Créer un compte Admin par défaut</h2>
      <p className="text-muted">Email : marwane.merezak.pro@gmail.com<br/>Mot de passe : azerty01</p>
      <button className="btn btn-danger" onClick={handleCreate}>
        Créer l'admin
      </button>
      {status && <div className="alert alert-info mt-3">{status}</div>}
    </div>
  );
};

export default CreateAdmin;
