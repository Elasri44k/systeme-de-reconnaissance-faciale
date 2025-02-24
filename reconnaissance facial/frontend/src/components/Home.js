import React, { useState } from "react";
import Register from "./Register";
import Verify from "./Verify";
import CustomButton from "./CustomButton"; // Import du bouton personnalisé
import { CSSTransition } from "react-transition-group";
import '../index.css'; // Assurez-vous que les styles sont bien importés
import '../style.css'


const Home = () => {
  const [isRegistering, setIsRegistering] = useState(true);

  return (
    <div className="container">
      <div className="home-card">
        {/* Titre et description */}
        <div className="home-header">
        <h1 className="home-title">    FaceAuth 🔐</h1>
        <p className="home-description">
          Sécurisez vos accès avec la reconnaissance faciale.
        </p>
      </div>

        {/* Boutons d'options */}
        <div className="home-buttons">
          <CustomButton isActive={isRegistering} onClick={() => setIsRegistering(true)}>
            S'inscrire
          </CustomButton>
          <CustomButton isActive={!isRegistering} onClick={() => setIsRegistering(false)}>
            Vérifier
          </CustomButton>
        </div>

        {/* Contenu dynamique avec animation de transition */}
        <div className="home-content">
          <CSSTransition in={isRegistering} timeout={300} classNames="slide" unmountOnExit>
            <Register />
          </CSSTransition>
          <CSSTransition in={!isRegistering} timeout={300} classNames="slide" unmountOnExit>
            <Verify />
          </CSSTransition>
        </div>
      </div>
    </div>
  );
};

export default Home;