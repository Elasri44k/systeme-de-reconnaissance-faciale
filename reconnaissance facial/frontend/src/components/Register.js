import React, { useState } from 'react';
import axios from 'axios';
import '../style.css'; // Importez le fichier CSS

const Register = () => {
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomUtilisateur || !image) {
      setMessage("Le nom d'utilisateur et l'image sont obligatoires.");
      return;
    }

    const formData = new FormData();
    formData.append('nom_utilisateur', nomUtilisateur);
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5000/enregistrer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage(response.data.message);
    } catch (error) {
      setMessage('Erreur lors de l\'enregistrement, veuillez réessayer.');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Enregistrement Utilisateur</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={nomUtilisateur}
          onChange={(e) => setNomUtilisateur(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="register-input"
          required
        />
        <button
          type="submit"
          className="register-button"
        >
          Enregistrer
        </button>
      </form>
      {message && <p className="register-message">{message}</p>}
    </div>
  );
};

export default Register;