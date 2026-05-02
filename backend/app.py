from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
import psycopg2
import psycopg2.extras
import os

app = Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'school-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:password@localhost/schooldb')

def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    return conn

def db_query(query, params=None, fetchone=False, fetchall=False, commit=False):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(query, params)
        if commit:
            conn.commit()
        if fetchone:
            return cur.fetchone()
        if fetchall:
            return cur.fetchall()
        return None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

# =================== AUTH ===================

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    phone = data.get('phone')
    password = data.get('password')
    role = data.get('role')  # admin, teacher, parent

    if role == 'admin':
        user = db_query("SELECT * FROM admins WHERE phone=%s", (phone,), fetchone=True)
    elif role == 'teacher':
        user = db_query("SELECT * FROM teachers WHERE phone=%s", (phone,), fetchone=True)
    elif role == 'parent':
        user = db_query("SELECT * FROM students WHERE parent_phone=%s", (phone,), fetchone=True)
    else:
        return jsonify({'error': 'Invalid role'}), 400

    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid credentials'}), 401

    identity = {'id': user['id'], 'role': role, 'phone': phone}
    if role == 'parent':
        identity['student_id'] = user['id']
        identity['student_name'] = user['name']

    token = create_access_token(identity=str(identity))
    return jsonify({
        'token': token,
        'role': role,
        'name': user['name']
    })

# =================== ADMIN ===================

@app.route('/api/admin/dashboard', methods=['GET'])
@jwt_required()
def admin_dashboard():
    classes = db_query("SELECT COUNT(*) as count FROM classes", fetchone=True)
    teachers = db_query("SELECT COUNT(*) as count FROM teachers", fetchone=True)
    students = db_query("SELECT COUNT(*) as count FROM students", fetchone=True)
    return jsonify({
        'classes': classes['count'],
        'teachers': teachers['count'],
        'students': students['count']
    })

# Classes
@app.route('/api/admin/classes', methods=['GET'])
@jwt_required()
def get_classes():
    classes = db_query("SELECT * FROM classes ORDER BY name", fetchall=True)
    return jsonify([dict(c) for c in classes])

@app.route('/api/admin/classes', methods=['POST'])
@jwt_required()
def create_class():
    data = request.json
    db_query("INSERT INTO classes (name, section) VALUES (%s, %s)",
             (data['name'], data.get('section', '')), commit=True)
    return jsonify({'message': 'Class created'})

@app.route('/api/admin/classes/<int:class_id>', methods=['DELETE'])
@jwt_required()
def delete_class(class_id):
    db_query("DELETE FROM classes WHERE id=%s", (class_id,), commit=True)
    return jsonify({'message': 'Class deleted'})

# Teachers
@app.route('/api/admin/teachers', methods=['GET'])
@jwt_required()
def get_teachers():
    teachers = db_query("SELECT id, name, phone, subject FROM teachers ORDER BY name", fetchall=True)
    return jsonify([dict(t) for t in teachers])

@app.route('/api/admin/teachers', methods=['POST'])
@jwt_required()
def create_teacher():
    data = request.json
    hashed = generate_password_hash(data['password'])
    db_query("INSERT INTO teachers (name, phone, password, subject) VALUES (%s, %s, %s, %s)",
             (data['name'], data['phone'], hashed, data.get('subject', '')), commit=True)
    return jsonify({'message': 'Teacher created'})

@app.route('/api/admin/teachers/<int:teacher_id>', methods=['DELETE'])
@jwt_required()
def delete_teacher(teacher_id):
    db_query("DELETE FROM teachers WHERE id=%s", (teacher_id,), commit=True)
    return jsonify({'message': 'Teacher deleted'})

# Students
@app.route('/api/admin/students', methods=['GET'])
@jwt_required()
def get_students():
    students = db_query("""
        SELECT s.*, c.name as class_name FROM students s
        LEFT JOIN classes c ON s.class_id = c.id ORDER BY s.name
    """, fetchall=True)
    return jsonify([dict(s) for s in students])

@app.route('/api/admin/students', methods=['POST'])
@jwt_required()
def create_student():
    data = request.json
    hashed = generate_password_hash(data['parent_password'])
    db_query("""INSERT INTO students (name, roll_no, parent_phone, password, class_id)
                VALUES (%s, %s, %s, %s, %s)""",
             (data['name'], data['roll_no'], data['parent_phone'], hashed, data['class_id']), commit=True)
    return jsonify({'message': 'Student created'})

@app.route('/api/admin/students/<int:student_id>', methods=['DELETE'])
@jwt_required()
def delete_student(student_id):
    db_query("DELETE FROM students WHERE id=%s", (student_id,), commit=True)
    return jsonify({'message': 'Student deleted'})

# =================== TEACHER ===================

@app.route('/api/teacher/tests', methods=['GET'])
@jwt_required()
def get_tests():
    tests = db_query("""
        SELECT t.*, c.name as class_name FROM tests t
        LEFT JOIN classes c ON t.class_id = c.id ORDER BY t.created_at DESC
    """, fetchall=True)
    return jsonify([dict(t) for t in tests])

@app.route('/api/teacher/tests', methods=['POST'])
@jwt_required()
def create_test():
    data = request.json
    identity = eval(get_jwt_identity())
    db_query("""INSERT INTO tests (name, class_id, max_marks, teacher_id)
                VALUES (%s, %s, %s, %s)""",
             (data['name'], data['class_id'], data['max_marks'], identity['id']), commit=True)
    return jsonify({'message': 'Test created'})

@app.route('/api/teacher/tests/<int:test_id>/students', methods=['GET'])
@jwt_required()
def get_test_students(test_id):
    test = db_query("SELECT * FROM tests WHERE id=%s", (test_id,), fetchone=True)
    students = db_query("""
        SELECT s.id, s.name, s.roll_no,
               COALESCE(m.marks, -1) as marks
        FROM students s
        LEFT JOIN marks m ON m.student_id = s.id AND m.test_id = %s
        WHERE s.class_id = %s ORDER BY s.roll_no
    """, (test_id, test['class_id']), fetchall=True)
    return jsonify([dict(s) for s in students])

@app.route('/api/teacher/marks', methods=['POST'])
@jwt_required()
def save_marks():
    data = request.json
    # data = {test_id, marks: [{student_id, marks}]}
    for m in data['marks']:
        existing = db_query("SELECT id FROM marks WHERE test_id=%s AND student_id=%s",
                            (data['test_id'], m['student_id']), fetchone=True)
        if existing:
            db_query("UPDATE marks SET marks=%s WHERE test_id=%s AND student_id=%s",
                     (m['marks'], data['test_id'], m['student_id']), commit=True)
        else:
            db_query("INSERT INTO marks (test_id, student_id, marks) VALUES (%s, %s, %s)",
                     (data['test_id'], m['student_id'], m['marks']), commit=True)
    return jsonify({'message': 'Marks saved'})

@app.route('/api/teacher/classes', methods=['GET'])
@jwt_required()
def teacher_classes():
    classes = db_query("SELECT * FROM classes ORDER BY name", fetchall=True)
    return jsonify([dict(c) for c in classes])

# =================== PARENT ===================

@app.route('/api/parent/results', methods=['GET'])
@jwt_required()
def parent_results():
    identity = eval(get_jwt_identity())
    student_id = identity['student_id']

    student = db_query("SELECT s.*, c.name as class_name FROM students s LEFT JOIN classes c ON s.class_id=c.id WHERE s.id=%s",
                       (student_id,), fetchone=True)

    results = db_query("""
        SELECT t.name as test_name, t.max_marks, m.marks,
               ROUND((m.marks::numeric / t.max_marks) * 100, 1) as percentage
        FROM marks m
        JOIN tests t ON m.test_id = t.id
        WHERE m.student_id = %s
        ORDER BY t.created_at DESC
    """, (student_id,), fetchall=True)

    return jsonify({
        'student': dict(student),
        'results': [dict(r) for r in results]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
