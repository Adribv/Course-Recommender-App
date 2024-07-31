import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, jsonify, request
from flask_cors import CORS
from waitress import serve

# Load environment variables from .env file
load_dotenv()

# Initialize Firestore DB
cred = credentials.Certificate({
    "type": os.getenv("FIREBASE_TYPE"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL")
})

firebase_admin.initialize_app(cred)
db = firestore.client()

# Fetch User Data from Firestore
def fetch_user_data(user_id):
    user_ref = db.collection('userData').document(user_id)
    user_data = user_ref.get().to_dict()
    return user_data

# Fetch Course Data from CSV
def fetch_course_data(csv_path):
    df = pd.read_csv(csv_path)
    course_data = df.to_dict(orient='records')
    return course_data

# Create User and Course Profiles
def create_user_profile(user_data):
    careerGoals = user_data.get('careerGoals', '')
    interests = user_data.get('interests', '')
    skills = user_data.get('skills', '')
    return f"{careerGoals} {interests} {skills}"

def create_course_profile(course):
    return f"{course['Course Title']} {course['What you will learn']} {course['Keyword']}"

# Vectorize Text Data
def vectorize_text(vectorizer, data):
    return vectorizer.transform(data)

# Compute Similarity Scores and Recommend Courses
def recommend_courses(user_vec, course_vecs, course_data, top_n=5):
    cosine_sim = cosine_similarity(user_vec, course_vecs)
    top_indices = cosine_sim.argsort()[0, -top_n:][::-1]
    recommended_courses = [course_data[i] for i in top_indices]
    return recommended_courses

# Save recommendations to Firestore
def save_recommendations(user_id, recommendations):
    recommendations_ref = db.collection('recommendations').document(user_id)
    recommendations_ref.set({'courses': recommendations})

# Load course data from CSV and prepare vectorizer
course_data = fetch_course_data('CourseraDataset-Clean.csv')
course_profiles = [create_course_profile(course) for course in course_data]
vectorizer = TfidfVectorizer(stop_words='english')
course_vecs = vectorizer.fit_transform(course_profiles)

# Set up Flask API
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/recommend', methods=['GET'])
def get_recommendations():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    user_data = fetch_user_data(user_id)
    if not user_data:
        return jsonify({"error": "User not found"}), 404

    user_profile = create_user_profile(user_data)
    user_vec = vectorize_text(vectorizer, [user_profile])
    recommended_courses = recommend_courses(user_vec, course_vecs, course_data)
    
    # Save recommendations to Firestore
    save_recommendations(user_id, recommended_courses)
    
    return jsonify(recommended_courses)

if __name__ == '__main__':
    # Use Waitress to serve the app
    serve(app, host='0.0.0.0', port=8000)
