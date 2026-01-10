"""
Part 2: Full CRUD Operations with HTML Forms
=============================================
Complete Create, Read, Update, Delete operations with user forms.

What You'll Learn:
- HTML forms with POST method
- request.form to get form data
- UPDATE and DELETE SQL commands
- redirect() and url_for() functions
- Flash messages for user feedback

Prerequisites: Complete part-1 first
"""

from flask import Flask, render_template, request, redirect, url_for, flash
import sqlite3
import re

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Required for flash messages

DATABASE = 'students.db'


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            course TEXT NOT NULL,
            mobile INTEGER NOT NULL
        );
    ''')
    conn.commit()
    conn.close()


#Validation function
def is_valid_mobile(mobile):
    return re.fullmatch(r"[0-9]{10}", mobile)


# =============================================================================
# CREATE - Add new student
# =============================================================================

@app.route('/add', methods=['GET', 'POST'])  # Allow both GET and POST
def add_student():
    if request.method == 'POST':  # Form was submitted
        name = request.form['name']  # Get data from form field named 'name'
        email = request.form['email']
        course = request.form['course']
        mobile = request.form['mobile']

     #  MOBILE VALIDATION (YAHI LAGTI HAI)
        if not is_valid_mobile(mobile):
            flash('Invalid mobile number! Enter 10 digits.', 'danger')
            return redirect(url_for('add_student'))

        conn = get_db_connection()

    # EMAIL ALREADY EXISTS CHECK
        existing_email = conn.execute(
            'SELECT * FROM students WHERE email = ?',
            (email,)
        ).fetchone()

        if existing_email:
            conn.close()
            flash('Email already exists! Please use another email.', 'danger')
            return redirect(url_for('add_student'))
        
        conn.execute(
            'INSERT INTO students (name, email, course, mobile) VALUES (?, ?, ?, ?)',
            (name, email, course, mobile)
        )
        conn.commit()
        conn.close()

        flash('Student added successfully!', 'success')  # Show success message
        return redirect(url_for('index'))  # Go back to home page

    return render_template('add.html')  # GET request: show empty form


# =============================================================================
# READ - Display all students
# =============================================================================

@app.route('/')
def index():
    conn = get_db_connection()
    students = conn.execute('SELECT * FROM students ORDER BY id DESC').fetchall()  # Newest first
    conn.close()
    return render_template('index.html', students=students)


# =============================================================================
# UPDATE - Edit existing student
# =============================================================================

@app.route('/edit/<int:id>', methods=['GET', 'POST'])
def edit_student(id):
    conn = get_db_connection()

    if request.method == 'POST':  # Form submitted with new data
        name = request.form['name']
        email = request.form['email']
        course = request.form['course']
        mobile = request.form['mobile']
        
         # MOBILE VALIDATION (YAHIN)
        if not is_valid_mobile(mobile):
            flash('Invalid mobile number! Enter 10 digits.', 'danger')
            conn.close()
            return redirect(url_for('edit_student', id=id))
        
        # EMAIL EXISTS CHECK (exclude current student)
        existing_email = conn.execute(
            'SELECT * FROM students WHERE email = ? AND id != ?',
            (email, id)
        ).fetchone()

        if existing_email:
            conn.close()
            flash('Email already exists for another student!', 'danger')
            return redirect(url_for('edit_student', id=id))
        
        conn.execute(
            'UPDATE students SET name = ?, email = ?, course = ?, mobile = ? WHERE id = ?',
            (name, email, course, mobile, id)  # Update WHERE id matches
        )
        conn.commit()
        conn.close()

        flash('Student updated successfully!', 'success')
        return redirect(url_for('index'))

    # GET request: fetch current data and show in form
    student = conn.execute('SELECT * FROM students WHERE id = ?', (id,)).fetchone()
    conn.close()
    return render_template('edit.html', student=student)


# =============================================================================
# DELETE - Remove student
# =============================================================================

@app.route('/delete/<int:id>')
def delete_student(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM students WHERE id = ?', (id,))  # Remove row
    conn.commit()
    conn.close()

    flash('Student deleted!', 'danger')  # Show delete message
    return redirect(url_for('index'))

# =============================================================================
#  Search-  by name
# =============================================================================
@app.route('/search')
def search():
    query = request.args.get('q')

    conn = get_db_connection()
    students = conn.execute(
        "SELECT * FROM students WHERE name LIKE ?",
        ('%' + query + '%',)
    ).fetchall()
    conn.close()

    return render_template('index.html', students=students)


if __name__ == '__main__':
    init_db()
    app.run(debug=True)


# =============================================================================
# CRUD SUMMARY:
# =============================================================================
#
# Operation | HTTP Method | SQL Command | Route Example
# ----------|-------------|-------------|---------------
# Create    | POST        | INSERT INTO | /add
# Read      | GET         | SELECT      | / or /student/1
# Update    | POST        | UPDATE      | /edit/1
# Delete    | GET/POST    | DELETE      | /delete/1
#
# =============================================================================
# NEW CONCEPTS:
# =============================================================================
#
# 1. methods=['GET', 'POST']
#    - GET: Display the form (empty or with current data)
#    - POST: Process the submitted form
#
# 2. request.form['field_name']
#    - Gets the value from HTML form input with that name
#
# 3. redirect(url_for('function_name'))
#    - Sends user to another page after action completes
#
# 4. flash('message', 'category')
#    - Shows one-time message to user
#    - Categories: 'success', 'danger', 'warning', 'info'
#
# =============================================================================


# =============================================================================
# EXERCISE:
# =============================================================================
#
# 1. Add a "Search" feature to find students by name
# 2. Add validation to check if email already exists before adding
#
# =============================================================================
