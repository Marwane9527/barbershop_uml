import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    nom_complet: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setErrorMsg("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) setErrorMsg(error.message);
      else navigate("/");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.user) {
        const { error: insertError } = await supabase.from("utilisateurs").insert([
          {
            id: data.user.id,
            email: form.email,
            nom_complet: form.nom_complet,
            role: "client", 
          },
        ]);

        if (insertError) {
          console.error("Erreur insertion utilisateur :", insertError.message);
          setErrorMsg("Inscription partielle : profil non enregistré");
        } else {
          alert("Inscription réussie ! Vérifiez vos emails.");
          setIsLogin(true);
        }
      }
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card p-4">
          <h3 className="text-center mb-3">
            {isLogin ? "Connexion" : "Inscription"}
          </h3>

          {!isLogin && (
            <input
              className="form-control mb-3"
              name="nom_complet"
              type="text"
              placeholder="Nom complet"
              value={form.nom_complet}
              onChange={handleChange}
            />
          )}

          <input
            className="form-control mb-3"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            className="form-control mb-3"
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
          />

          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <button className="btn btn-primary w-100 mb-2" onClick={handleSubmit}>
            {isLogin ? "Se connecter" : "S'inscrire"}
          </button>

          <button className="btn btn-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Créer un compte" : "Déjà inscrit ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
