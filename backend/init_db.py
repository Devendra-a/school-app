"""Run this once to set up the database and create default admin"""
import psycopg2
from werkzeug.security import generate_password_hash
import os

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:password@localhost/schooldb')

def init_db():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # Create tables
    with open('schema.sql', 'r') as f:
        sql = f.read()
    
    # Run only CREATE TABLE statements
    statements = [s.strip() for s in sql.split(';') if 'CREATE TABLE' in s]
    for stmt in statements:
        if stmt:
            cur.execute(stmt)

    # Create default admin
    hashed = generate_password_hash('admin123')
    cur.execute("""
        INSERT INTO admins (name, phone, password) 
        VALUES ('Super Admin', '9999999999', %s)
        ON CONFLICT (phone) DO NOTHING
    """, (hashed,))

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Database initialized!")
    print("Admin Login:")
    print("  Phone: 9999999999")
    print("  Password: admin123")

if __name__ == '__main__':
    init_db()
