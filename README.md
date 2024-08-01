---


# Course Recommender App

This is a web-based application designed to recommend courses to users based on their preferences or interests. The application uses a machine learning model to provide personalized course suggestions.

## Table of Contents
- Features
- Installation
- Usage
- Model
- Benchmarking
  


## Features
- Personalized course recommendations based on user input.
- Web-based interface for ease of use.
- Responsive design for use on multiple devices.
- Integration with backend services for data processing and model predictions.

## Installation

### Prerequisites
- Python 3.7+
- Pipenv or Virtualenv for dependency management
- Node.js and npm (for frontend development)

### Steps
1. **Clone the Repository:**
  ```
   bash
   git clone https://github.com/Adribv/Course-Recommender-App.git
   cd Course-Recommender-App
   ```

3. **Set Up Virtual Environment:**
   ```
   bash
   pipenv install --dev
   pipenv shell
   ```

4. **Install Dependencies:**

   ```
   bash
   pip install -r requirements.txt
   ```

6. **Set Up Frontend:**
   Navigate to the `frontend` directory and install dependencies.
   ```
   bash
   cd frontend
   npm install
   npm run build
   ```

7. **Run the Application:**
   Back in the root directory, start the server.
   ```
   bash
   gunicorn --bind 0.0.0.0:8000 app:app
   ```

8. **Access the Application:**
   Open your web browser and navigate to `http://localhost:8000`.

## Usage

### Interacting with the Application
- The main page will allow you to enter your preferences or interests.
- Based on the input, the application will recommend a list of relevant courses.

### API Endpoints
- **GET /recommend**: Fetches course recommendations.
- **POST /predict**: Sends user data and receives predictions.



## Model

### Training
- The model was trained using a dataset of courses and user interactions.
- The data was preprocessed and fed into a machine learning algorithm (e.g., RandomForest, SVM).




## Benchmarking
### Model Performance
- **Prediction Time**: The time it takes to generate predictions.

### API Performance
- **Response Time**: The time taken to receive a response from the API.

### Frontend Performance
- **Page Load Time**: Time taken for the application to load in the browser.
- **Interaction Performance**: Time taken for user actions (e.g., form submissions) to be processed.

Tools like Apache Benchmark, Google Lighthouse, and Locust can be used for benchmarking.



---
