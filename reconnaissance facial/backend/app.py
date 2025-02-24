from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import numpy as np
import cv2  # OpenCV pour Haar Cascade
from PIL import Image
from deepface import DeepFace
import mediapipe as mp

app = Flask(__name__)
CORS(app)

DATABASE_FILE = 'database.json'
UPLOAD_FOLDER = 'uploads/'
SEUIL_DISTANCE =2 # Seuil pour la reconnaissance faciale

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Charger le modèle Haar Cascade
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

# === Gestion de la base de données JSON ===
def charger_base_de_donnees():
    """ Charge la base de données des utilisateurs ou retourne un dictionnaire vide. """
    if os.path.exists(DATABASE_FILE):
        if os.path.getsize(DATABASE_FILE) > 0:  # Vérifie si le fichier n'est pas vide
            with open(DATABASE_FILE, 'r') as f:
                try:
                    return json.load(f)
                except json.JSONDecodeError:
                    print("Erreur : fichier JSON corrompu. Réinitialisation...")
                    return {}
        else:
            print("Fichier JSON vide. Initialisation d'une nouvelle base de données...")
            return {}
    return {}

def sauvegarder_base_de_donnees(database):
    """ Sauvegarde la base de données sous forme de fichier JSON. """
    with open(DATABASE_FILE, 'w') as f:
        json.dump(database, f, indent=4)


# === Fonctions de traitement d'images ===
def extraire_visage(image_path):
    """ Détecte et extrait le visage d'une image avec Haar Cascade. """
    image = cv2.imread(image_path)
    h, w, _ = image.shape  # Récupérer les dimensions de l'image

    # Convertir l'image en RGB (MediaPipe fonctionne mieux avec ce format)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Initialiser le modèle de détection faciale
    with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detection:
        results = face_detection.process(image_rgb)

        # Vérifier si un visage a été détecté
        if not results.detections:
            print("Aucun visage détecté.")
            return None

        # Prendre seulement le premier visage détecté
        detection = results.detections[0]
        bboxC = detection.location_data.relative_bounding_box
        
        # Convertir les coordonnées relatives en pixels
        x, y, w_bbox, h_bbox = (
            int(bboxC.xmin * w),
            int(bboxC.ymin * h),
            int(bboxC.width * w),
            int(bboxC.height * h),
        )

        # Ajouter un padding pour éviter les coupures trop serrées
        padding = 0
        x = max(0, x - padding)
        y = max(0, y - padding)
        w_bbox = min(w, w_bbox + 2 * padding)
        h_bbox = min(h, h_bbox + 2 * padding)

        # Extraire le visage
        visage = image[y:y+h_bbox, x+20:x+w_bbox-20]
    # Sauvegarde du visage extrait
    visage_path = os.path.join(UPLOAD_FOLDER, 'visage_temp.jpg')
    cv2.imwrite(visage_path, visage)
    return visage_path

def generer_embedding(image_path):
    """ Génère un embedding avec DeepFace (ArcFace). """
    try:
        embedding = DeepFace.represent(image_path, model_name='ArcFace')[0]['embedding']
        return embedding
    except Exception as e:
        print(f"Erreur lors de la génération d'embedding: {e}")
        return None


# === Routes de l'API ===
@app.route('/enregistrer', methods=['POST'])
def enregistrer_utilisateur():
    """ Enregistre un nouvel utilisateur avec son image. """
    nom_utilisateur = request.form.get('nom_utilisateur')
    fichier_image = request.files.get('image')
    
    if not nom_utilisateur or not fichier_image:
        return jsonify({"erreur": "Nom d'utilisateur ou image manquant."}), 400

    image_path = os.path.join(UPLOAD_FOLDER, fichier_image.filename)
    fichier_image.save(image_path)

    visage_path = extraire_visage(image_path)
    os.remove(image_path)
    if visage_path is None:
        return jsonify({"erreur": "Aucun visage détecté."}), 400

    embedding = generer_embedding(visage_path)
    if embedding is None:
        return jsonify({"erreur": "Erreur lors de la génération d'embedding."}), 500

    database = charger_base_de_donnees()
    database[nom_utilisateur] = embedding
    sauvegarder_base_de_donnees(database)
    
    return jsonify({"message": "Utilisateur enregistré avec succès."}), 200

@app.route('/verifier', methods=['POST'])
def verifier_visage():
    """ Vérifie un visage en le comparant à la base de données et retourne les détails. """
    fichier_image = request.files.get('image')
    if not fichier_image:
        return jsonify({"erreur": "Image manquante."}), 400

    image_path = os.path.join(UPLOAD_FOLDER, fichier_image.filename)
    fichier_image.save(image_path)

    visage_path = extraire_visage(image_path)
    os.remove(image_path)
    
    if visage_path is None:
        return jsonify({"erreur": "Aucun visage détecté."}), 400

    # Analyser l'image pour obtenir des informations sur l'âge, le genre, l'émotion dominante, et la race
    analysis = DeepFace.analyze(visage_path, actions=['age', 'gender', 'emotion', 'race'])
    data = analysis[0]  # Prendre le premier élément de la liste (dictionnaire)

    # Accéder aux données du dictionnaire
    age = int(data.get('age', -1))  # -1 si 'age' n'existe pas
    gender = data.get('dominant_gender', 'Inconnu')
    dominant_emotion = data.get('dominant_emotion', 'Inconnu')
    race = data.get('dominant_race', 'Inconnu')
    # Générer l'embedding du visage
    embedding = generer_embedding(visage_path)
    if embedding is None:
        return jsonify({"erreur": "Erreur lors de la génération d'embedding."}), 500
    
    # Comparer l'embedding avec ceux de la base de données
    database = charger_base_de_donnees()
    if not database:
        return jsonify({"erreur": "Base de données vide."}), 500

    for nom_utilisateur, saved_embedding in database.items():
        distance = np.linalg.norm(np.array(saved_embedding) - np.array(embedding))
        if distance < SEUIL_DISTANCE:
            # Si une correspondance est trouvée, on retourne les informations de l'utilisateur et l'analyse du visage
            return jsonify({
                "message": f"Accès autorisé pour : {nom_utilisateur}",
                "details": {
                    "age": age,
                    "gender": gender,
                    "dominant_emotion": dominant_emotion,
                    "race": race
                }
            }), 200
    
    return jsonify({"message": "Visage inconnu. Accès refusé."}), 401



# === Lancer le serveur Flask ===
if __name__ == '__main__':
    app.run(debug=True)

