import os
from dotenv import load_dotenv
import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from functools import wraps
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, jsonify, request
from flask_cors import CORS
from waitress import serve

# Load environment variables from .env file
load_dotenv()

# JWT Secret Key
JWT_SECRET = "testing-secret-123"
JWT_EXPIRATION_DELTA = timedelta(days=7)


# PostgreSQL connection function
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="course_recommender",
            user="jeyasurya",
            password="jeyasuryaur",
        )
        conn.autocommit = True
        print("Database connection established successfully.")
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {str(e)}")
        raise

# Initialize database tables
def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Create tables if they don't exist
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        )
        print("Table 'users' checked/created successfully.")

        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS user_data (
            user_id INTEGER PRIMARY KEY REFERENCES users(id),
            career_goals TEXT,
            skills TEXT,
            interests TEXT,
            name TEXT,
            age INTEGER,
            job_role TEXT,
            interested_courses TEXT,
            liked_courses TEXT
        )
        """
        )
        print("Table 'user_data' checked/created successfully.")

        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS recommendations (
            user_id INTEGER PRIMARY KEY REFERENCES users(id),
            courses JSONB
        )
        """
        )
        print("Table 'recommendations' checked/created successfully.")

        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS feedback (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            text TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        )
        print("Table 'feedback' checked/created successfully.")

        cursor.close()
        conn.close()
        print("Database initialization completed successfully.")
    except Exception as e:
        print(f"Error initializing the database: {str(e)}")
        raise

# JWT Token Authentication Decorator - Simplified version without verification
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Get token from header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                print("Token found in header")
                token = auth_header.split(" ")[1]
                print("Extracted token:", token)

        if not token:
            print("Token not found in header")
            return jsonify({"error": "Token is missing"}), 401

        try:
            # Extract user ID from token without verification
            # Extract payload from JWT token (second part between dots)
            payload = token.split('.')[1]
            
            # Add padding if needed
            payload += '=' * (4 - len(payload) % 4)
            
            # Decode base64
            import base64
            decoded_bytes = base64.b64decode(payload)
            decoded_str = decoded_bytes.decode('utf-8')
            
            # Parse JSON
            import json
            data = json.loads(decoded_str)
            
            print("Extracted data from token:", data)
            user_id = data.get("sub")
            
            if not user_id:
                return jsonify({"error": "Invalid token format"}), 401

            # Get user from database
            conn = get_db_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("SELECT id, email FROM users WHERE id = %s", (user_id,))
            current_user = cursor.fetchone()
            cursor.close()
            conn.close()

            if not current_user:
                return jsonify({"error": "User not found"}), 401

        except Exception as e:
            print(f"Error processing token: {str(e)}")
            # For debugging, return a detailed error
            return jsonify({"error": f"Error processing token: {str(e)}"}), 401

        return f(current_user, *args, **kwargs)

    return decorated

# Fetch User Data from PostgreSQL
def fetch_user_data(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("SELECT * FROM user_data WHERE user_id = %s", (user_id,))
    user_data = cursor.fetchone()

    cursor.close()
    conn.close()

    return user_data

# Fetch Course Data from CSV
def fetch_course_data(csv_path):
    df = pd.read_csv(csv_path)
    course_data = df.to_dict(orient="records")
    return course_data


# Create User and Course Profiles
def create_user_profile(user_data):
    career_goals = user_data.get("career_goals", "")
    interests = user_data.get("interests", "")
    skills = user_data.get("skills", "")
    return f"{career_goals} {interests} {skills}"


def create_course_profile(course):
    return (
        f"{course['Course Title']} {course['What you will learn']} {course['Keyword']}"
    )

# Vectorize Text Data
def vectorize_text(vectorizer, data):
    return vectorizer.transform(data)

# Compute Similarity Scores and Recommend Courses
def recommend_courses(user_vec, course_vecs, course_data, top_n=5):
    cosine_sim = cosine_similarity(user_vec, course_vecs)
    top_indices = cosine_sim.argsort()[0, -top_n:][::-1]
    recommended_courses = [course_data[i] for i in top_indices]
    return recommended_courses


# Save recommendations to PostgreSQL
def save_recommendations(user_id, recommendations):
    conn = get_db_connection()
    cursor = conn.cursor()

    import json

    courses_json = json.dumps(recommendations)

    cursor.execute(
        """
    INSERT INTO recommendations (user_id, courses)
    VALUES (%s, %s)
    ON CONFLICT (user_id) 
    DO UPDATE SET courses = EXCLUDED.courses
    """,
        (user_id, courses_json),
    )

    cursor.close()
    conn.close()


# Load course data from CSV and prepare vectorizer
course_data = fetch_course_data("CourseraDataset-Clean.csv")
course_profiles = [create_course_profile(course) for course in course_data]
vectorizer = TfidfVectorizer(stop_words="english")
course_vecs = vectorizer.fit_transform(course_profiles)

# Initialize the database tables
init_db()

# Set up Flask API
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Registration endpoint
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode(
        "utf-8"
    )

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Insert new user
        cursor.execute(
            "INSERT INTO users (email, password) VALUES (%s, %s) RETURNING id",
            (email, hashed_password),
        )
        user_id = cursor.fetchone()[0]

        # Create empty user_data entry
        cursor.execute("INSERT INTO user_data (user_id) VALUES (%s)", (user_id,))

        # Generate token
        token = jwt.encode(
            {
                "sub": user_id,
                "email": email,
                "exp": datetime.now(timezone.utc) + JWT_EXPIRATION_DELTA,
            },
            JWT_SECRET,
            algorithm="HS256",
        )

        return jsonify({"id": user_id, "email": email, "token": token})
    except psycopg2.errors.UniqueViolation:
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Login endpoint
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Get user
        cursor.execute(
            "SELECT id, email, password FROM users WHERE email = %s", (email,)
        )
        user = cursor.fetchone()

        if not user or not bcrypt.checkpw(
            password.encode("utf-8"), user["password"].encode("utf-8")
        ):
            return jsonify({"error": "Invalid email or password"}), 401

        # Generate token
        token = jwt.encode(
            {
                "sub": user["id"],
                "email": user["email"],
                "exp": datetime.now(timezone.utc) + JWT_EXPIRATION_DELTA,
            },
            JWT_SECRET,
            algorithm="HS256",
        )

        # Fetch user profile data
        cursor.execute("SELECT name FROM user_data WHERE user_id = %s", (user["id"],))
        profile = cursor.fetchone()
        name = profile["name"] if profile and profile["name"] else None

        return jsonify(
            {"id": user["id"], "email": user["email"], "name": name, "token": token}
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# Profile endpoints
@app.route("/api/profile", methods=["GET"])
@token_required
def get_profile(current_user):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            "SELECT * FROM user_data WHERE user_id = %s", (current_user["id"],)
        )
        profile = cursor.fetchone()

        if not profile:
            return jsonify({})

        return jsonify(profile)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/profile", methods=["POST"])
@token_required
def save_profile(current_user):
    data = request.json
    fields = [
        "career_goals",
        "skills",
        "interests",
        "name",
        "age",
        "job_role",
        "interested_courses",
        "liked_courses",
    ]

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Prepare SQL query dynamically based on what fields are provided
        fields_to_update = [f for f in fields if f in data]

        if not fields_to_update:
            return jsonify({"message": "No fields to update"}), 400

        # Build query parts
        set_clause = ", ".join([f"{field} = %s" for field in fields_to_update])
        query = f"UPDATE user_data SET {set_clause} WHERE user_id = %s"

        # Build values tuple
        values = [data[field] for field in fields_to_update]
        values.append(current_user["id"])

        cursor.execute(query, tuple(values))

        # Generate recommendations if profile data is provided
        if "career_goals" in data or "skills" in data or "interests" in data:
            # Fetch complete user data
            cursor.close()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                "SELECT * FROM user_data WHERE user_id = %s", (current_user["id"],)
            )
            user_data = cursor.fetchone()

            if user_data:
                # Create user profile and generate recommendations
                user_profile = create_user_profile(user_data)
                user_vec = vectorize_text(vectorizer, [user_profile])
                recommendations = recommend_courses(user_vec, course_vecs, course_data)

                # Save recommendations
                save_recommendations(current_user["id"], recommendations)

        return jsonify({"message": "Profile updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Recommendations endpoint
@app.route("/api/recommendations", methods=["GET"])
@token_required
def get_recommendations(current_user):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            "SELECT courses FROM recommendations WHERE user_id = %s",
            (current_user["id"],),
        )
        result = cursor.fetchone()

        if not result:
            # If no recommendations exist, create them
            cursor.close()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                "SELECT * FROM user_data WHERE user_id = %s", (current_user["id"],)
            )
            user_data = cursor.fetchone()

            if not user_data:
                return jsonify([]), 200

            # Create user profile and generate recommendations
            user_profile = create_user_profile(user_data)
            user_vec = vectorize_text(vectorizer, [user_profile])
            recommendations = recommend_courses(user_vec, course_vecs, course_data)

            # Save recommendations
            save_recommendations(current_user["id"], recommendations)

            return jsonify(recommendations)

        return jsonify(result["courses"])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Course details endpoint
@app.route("/api/courses/<int:course_id>", methods=["GET"])
@token_required
def get_course_details(current_user, course_id):
    try:
        # Find course by ID in our loaded course data
        # In a real app, you'd query the database instead
        course = next((c for c in course_data if c.get("id") == course_id), None)

        if not course:
            return jsonify({"error": "Course not found"}), 404

        return jsonify(course)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Feedback endpoint
@app.route("/api/feedback", methods=["POST"])
@token_required
def submit_feedback(current_user):
    data = request.json
    feedback_text = data.get("text")

    if not feedback_text:
        return jsonify({"error": "Feedback text is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO feedback (user_id, text) VALUES (%s, %s)",
            (current_user["id"], feedback_text),
        )

        return jsonify({"message": "Feedback submitted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# For backward compatibility - will be removed later
@app.route("/recommend", methods=["GET"])
def get_legacy_recommendations():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Convert Firebase user_id to PostgreSQL user ID
        cursor.execute(
            "SELECT id FROM users WHERE email = %s", (user_id + "@firebase.com",)
        )
        result = cursor.fetchone()

        if not result:
            return jsonify({"error": "User not found"}), 404

        pg_user_id = result[0]

        # Get user data
        user_data = fetch_user_data(pg_user_id)
        if not user_data:
            return jsonify({"error": "User data not found"}), 404

        # Generate recommendations
        user_profile = create_user_profile(user_data)
        user_vec = vectorize_text(vectorizer, [user_profile])
        recommended_courses = recommend_courses(user_vec, course_vecs, course_data)

        # Save recommendations to PostgreSQL
        save_recommendations(pg_user_id, recommended_courses)

        return jsonify(recommended_courses)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    # Use Waitress to serve the app
    print("Serving on http://localhost:8000")
    serve(app, host="0.0.0.0", port=8000)
