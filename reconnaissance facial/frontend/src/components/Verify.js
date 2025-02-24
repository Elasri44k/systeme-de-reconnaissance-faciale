import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaSpinner } from "react-icons/fa";
import "../style.css"; // Importez le fichier CSS

const Verify = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Le fichier est trop volumineux (max 5MB).");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner un fichier image valide.");
        return;
      }

      setImage(file);
      setError("");
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post("http://localhost:5000/verifier", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        const params = new URLSearchParams({
          nom: response.data.message.replace("Accès autorisé pour : ", ""),
          age: response.data.details.age,
          gender: response.data.details.gender,
          emotion: response.data.details.dominant_emotion,
          race: response.data.details.race,
        }).toString();

        navigate(`/access-granted?${params}`);
      }
    } catch (error) {
      setError("Échec de la vérification. Vérifiez l'image et réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2 className="verify-title">Vérification d'Accès</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionnez une image
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="file-upload-label">
                <FaUpload className="text-2xl mb-2" />
                <span className="text-sm">{image ? image.name : "Cliquez pour téléverser"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-upload-input"
                  required
                />
              </label>
            </div>
          </div>

          {preview && (
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Aperçu de l'image"
                className="image-preview"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="verify-button"
          >
            {isLoading ? (
              <>
                <FaSpinner className="spinner" />
                Vérification en cours...
              </>
            ) : (
              "Vérifier"
            )}
          </button>
        </form>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default Verify;