import React from "react";

const Horaires = () => {
  const jours = [
    { nom: "Lundi", ouvert: false },
    { nom: "Mardi", ouvert: true },
    { nom: "Mercredi", ouvert: true },
    { nom: "Jeudi", ouvert: true },
    { nom: "Vendredi", ouvert: true },
    { nom: "Samedi", ouvert: true },
    { nom: "Dimanche", ouvert: true },
  ];

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Horaires d'ouverture du salon</h2>

      <table className="table table-bordered text-center">
        <thead className="table-dark">
          <tr>
            <th>Jour</th>
            <th>Horaires</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {jours.map((j, i) => (
            <tr key={i}>
              <td>{j.nom}</td>
              <td>{j.ouvert ? "09:00 - 19:00" : "-"}</td>
              <td>
                {j.ouvert ? (
                  <span className="badge bg-success">Ouvert</span>
                ) : (
                  <span className="badge bg-danger">Fermé</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Horaires;
