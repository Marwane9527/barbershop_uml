import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Booking = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [coiffeurs, setCoiffeurs] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedCoiffeur, setSelectedCoiffeur] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchCoiffeurs();
    fetchUserId();
  }, []);

  const fetchUserId = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id) {
      setUserId(authData.user.id);
    }
  };

  const fetchServices = async () => {
    const { data, error } = await supabase.from("services").select("*");
    if (!error) setServices(data);
  };

  const fetchCoiffeurs = async () => {
    const { data, error } = await supabase
      .from("utilisateurs")
      .select("id, nom_complet")
      .eq("role", "coiffeur");
    if (!error) setCoiffeurs(data);
  };

  const isDateValid = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay(); 
    return day !== 1 && day !== 0; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService || !selectedCoiffeur || !selectedDate || !selectedTime) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const fullDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const heure = fullDateTime.getHours();

    if (!isDateValid(selectedDate)) {
      alert("Les réservations sont disponibles du mardi au samedi.");
      return;
    }

    if (heure < 9 || heure >= 19) {
      alert("Veuillez choisir une heure entre 9h et 19h.");
      return;
    }

    const { error } = await supabase.from("rendez_vous").insert([
      {
        client_id: userId,
        coiffeur_id: selectedCoiffeur,
        service_id: selectedService,
        date_heure: fullDateTime.toISOString(),
        statut: "en_attente",
      },
    ]);

    if (error) {
  console.error("Erreur lors de la création du rendez-vous :", error);
  alert(`Erreur lors de la réservation du rendez-vous : ${error.message}`);
}

  };

  return (
    <div className="container mt-5">
      <h2>Créer une réservation</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Service</label>
          <select
            className="form-select"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            required
          >
            <option value="">-- Sélectionnez un service --</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.nom} ({service.prix}€)
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Coiffeur</label>
          <select
            className="form-select"
            value={selectedCoiffeur}
            onChange={(e) => setSelectedCoiffeur(e.target.value)}
            required
          >
            <option value="">-- Sélectionnez un coiffeur --</option>
            {coiffeurs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom_complet}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Heure</label>
          <input
            type="time"
            className="form-control"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
            min="09:00"
            max="19:00"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Réserver
        </button>
      </form>
    </div>
  );
};

export default Booking;
