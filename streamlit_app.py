# streamlit_app.py

import streamlit as st
import requests

def get_recommendations(user_id, num_courses):
    response = requests.get(f'http://localhost:5000/recommendations?user_id={user_id}&num_courses={num_courses}')
    return response.json()

st.title('Course Recommendation System')

user_id = st.number_input('Enter User ID:', min_value=1, value=1)
num_courses = st.slider('Number of Courses to Recommend:', min_value=1, max_value=10, value=5)

if st.button('Get Recommendations'):
    recommendations = get_recommendations(user_id, num_courses)
    st.write('Recommended Courses:')
    st.write(recommendations['recommendations'])
