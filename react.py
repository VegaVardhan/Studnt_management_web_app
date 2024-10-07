from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = 'supersecretkey'
Session(app)

CORS(app, supports_credentials=True)

# Database configuration
db_config = {
    'user': 'root',
    'password': 'vegamysql24',
    'host': 'localhost',
    'database': 'sms'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT email, password, Rights FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user:
        print(f"No user found with email {email}")
        return jsonify({'login': 'failed'}), 401

    print(f"User found: {user}")

    if check_password_hash(user['password'], password):
        session['email'] = user['email']
        session['rights'] = user['Rights']
        return jsonify({'login': 'success', 'rights': user['Rights']})
    else:
        print("Password check failed")
        return jsonify({'login': 'failed'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'logout': 'success'})

@app.route('/student-details', methods=['GET'])
def student_details():
    if 'email' not in session or session['rights'] != 0:
        return jsonify({'error': 'Unauthorized'}), 401

    email = session['email']
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT s.name, s.email, s.dept_name,c.title, c.course_id
        FROM studnt s
        JOIN takes t ON s.email = t.email
        JOIN course c ON t.course_id = c.course_id
        WHERE s.email = %s
    """, (email,))
    
    student_info = cursor.fetchall()
    cursor.close()
    conn.close()

    if student_info:
        return jsonify(student_info)
    else:
        return jsonify({'error': 'Student not found'}), 404

@app.route('/professor-details', methods=['GET'])
def professor_details():
    if 'email' not in session or session['rights'] != 1:
        return jsonify({'error': 'Unauthorized'}), 401

    email = session['email']
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT i.name, i.email, i.dept_name, t.course_id, c.title 
        FROM instructor i
        JOIN teaches t ON i.email = t.email
        JOIN course c ON t.course_id = c.course_id
        WHERE i.email = %s
    """, (email,))
    
    professor_info = cursor.fetchall()
    cursor.close()
    conn.close()

    if professor_info:
        return jsonify(professor_info)
    else:
        return jsonify({'error': 'Professor not found'}), 404

@app.route('/course-info/<course_id>', methods=['GET'])
def course_info(course_id):
    if 'email' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    email = session['email']
    user_rights = session['rights']

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if user_rights == 0:    #student
        cursor.execute("""
            SELECT s.name, s.email, s.dept_name, t.quiz1, t.midsem, t.quiz2, t.endsem, t.grade, c.title, c.course_id
            FROM studnt s
            JOIN takes t ON s.email = t.email
            JOIN course c ON t.course_id = c.course_id
            WHERE c.course_id = %s AND s.email = %s
        """, (course_id, email))
    elif user_rights == 1:  # Professor
        cursor.execute("""
            SELECT s.name, s.email, s.dept_name, t.quiz1, t.midsem, t.quiz2, t.endsem, t.grade, c.title, c.course_id
            FROM studnt s
            JOIN takes t ON s.email = t.email
            JOIN course c ON t.course_id = c.course_id
            WHERE c.course_id = %s
        """, (course_id,))
    
    course_info = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(course_info)

@app.route('/admin-data', methods=['GET'])
def admin_data():
    if 'email' not in session or session['rights'] != 1:
        return jsonify({'error': 'Unauthorized'}), 401

    email = session['email']
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT i.name, i.email, i.dept_name
        FROM instructor i
        WHERE i.email = %s
    """, (email,))
    professor = cursor.fetchone()

    cursor.execute("""
        SELECT c.course_id, c.title
        FROM teaches t
        JOIN course c ON t.course_id = c.course_id
        WHERE t.email = %s
    """, (email,))
    courses = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({'professor': professor, 'courses': courses})


@app.route('/course-details/<course_id>', methods=['GET'])
def course_details(course_id):
    if 'email' not in session or session['rights'] != 1:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT s.name, s.email, t.quiz1, t.midsem, t.quiz2, t.endsem, t.grade
        FROM studnt s
        JOIN takes t ON s.email = t.email
        WHERE t.course_id = %s
    """, (course_id,))
    
    students = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(students)

@app.route('/submit-marks/<course_id>', methods=['POST'])
def submit_marks(course_id):
    if 'email' not in session or session['rights'] != 1:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    for student_email, marks in data.items():
        quiz1 = marks.get('quiz1')
        midsem = marks.get('midsem')
        quiz2 = marks.get('quiz2')
        endsem = marks.get('endsem')

        cursor.execute("""
            UPDATE takes
            SET quiz1 = %s, midsem = %s, quiz2 = %s, endsem = %s
            WHERE email = %s AND course_id = %s
        """, (quiz1, midsem, quiz2, endsem, student_email, course_id))
    
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Marks submitted successfully'})

if __name__ == '__main__':
    app.run(debug=True)
