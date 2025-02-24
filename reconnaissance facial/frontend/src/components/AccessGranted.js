

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style.css"; 

const AccessGranted = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const data = {
      nom: params.get("nom"),
      age: params.get("age"),
      gender: params.get("gender"),
      emotion: params.get("emotion"),
      race: params.get("race"),
    };

    console.log("Données récupérées :", data); // Vérifie si les données sont bien récupérées

    setUserData(data);
  }, [location.search]);

  return (
    <div className="access-granted-container">
      <div className="access-granted-card">
        <h1 className="access-granted-title">✅ Accès Autorisé</h1>
        {userData && userData.nom ? (
          <>
            <p className="access-granted-welcome">
              Bienvenue, <span className="font-semibold">{userData.nom}</span> !
            </p>
            <div className="user-details">
              <p><strong>Âge:</strong> {userData.age} ans</p>
              <p><strong>Genre:</strong> {userData.gender}</p>
              <p><strong>Émotion dominante:</strong> {userData.emotion}</p>
              <p><strong>Race:</strong> {userData.race}</p>
            </div>
          </>
        ) : (
          <p className="text-lg text-red-500">Chargement des données...</p>
        )}
        <button
          onClick={() => navigate("/")}
          className="return-button"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default AccessGranted;
