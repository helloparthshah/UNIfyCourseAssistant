#!/usr/bin/python3
from bs4 import BeautifulSoup
import json
from icalendar import Event, Calendar
from flask import Flask
import requests

from datetime import datetime, timedelta
from flask import Response
import ratemyprofessor

import sqlite3
from flask import g

DATABASE = './database.db'

app = Flask(__name__)


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        cur = db.cursor()
        # create the courses table if it doesn't exist
        # crn, time, name, location, section, title, ge, instructor, units, discussion
        cur.execute(
            'CREATE TABLE IF NOT EXISTS courses (crn TEXT, time TEXT, course TEXT, location TEXT, section TEXT, seats NUMBER, name TEXT, ge TEXT, professor TEXT, units TEXT, discussion TEXT, discussion_location TEXT)')
        # create the students table if it doesn't exist
        cur.execute(
            'CREATE TABLE IF NOT EXISTS students (user_id TEXT, courses TEXT)')
        db.commit()
    db.row_factory = sqlite3.Row
    return db


''' def init_sqlite():
    con = None
    try:
        con = sqlite3.connect(r'./courses.db')
        cur = con.cursor()
        # create the courses table if it doesn't exist
        # crn, time, name, location, section, title, ge, instructor, units, discussion
        cur.execute(
            'CREATE TABLE IF NOT EXISTS courses (crn TEXT, time TEXT, name TEXT, location TEXT, section TEXT, title TEXT, ge TEXT, instructor TEXT, units TEXT, discussion TEXT)')
        # create the students table if it doesn't exist
        cur.execute(
            'CREATE TABLE IF NOT EXISTS students (user_id TEXT, courses TEXT)')
        # create the reminders table if it doesn't exist
        cur.execute(
            'CREATE TABLE IF NOT EXISTS reminders (user_id TEXT, course TEXT, time TEXT)')
        con.commit()
        return con
    except Error as e:
        print(e)
    return con


conn = init_sqlite() '''

# term = '01' if datetime.now().month <= 3 else '03' if datetime.now().month <= 6 else '10'
term = '03'


def getClassInfo(course):
    sections = []
    cur = get_db().cursor()
    cur.execute(
        "SELECT * FROM courses WHERE course LIKE ?", (course.upper().replace(' ', ''),))
    rows = cur.fetchall()
    if len(rows) > 0:
        for row in rows:
            row = {
                'crn': row['crn'],
                'time': row['time'],
                'course': row['course'],
                'location': row['location'],
                'section': row['section'],
                'seats': row['seats'],
                'name': row['name'],
                'ge': row['ge'],
                'professor': row['professor'],
                'units': row['units'],
                'discussion': row['discussion'],
                'discussion_location': row['discussion_location']
            }
            sections.append(row)
        return sections

    # Spring 2022=202203 Winter 2022=202201 Fall 2022=202210
    year = datetime.now().year
    termCode = f'{year}{term}'
    response = requests.post('https://registrar-apps.ucdavis.edu/courses/search/course_search_results.cfm',
                             data={
                                 'termCode': termCode,
                                 'course_number': course,
                             })
    soup = BeautifulSoup(response.text, 'html.parser')
    course_info = soup.find_all(
        'tr', attrs={'onmouseover': "this.bgColor='#D9E0EC'"})
    for c in course_info:
        row = []
        for td in c.find_all('td'):
            for line in td.text.split('\n'):
                if line.strip() == '':
                    continue
                row.append(line.replace('•\xa0', '').strip())
        # convert row to json
        # "40573", "11:00 - 11:50 AM, F", "ECS 150", "HUNT 100", "A01", "0", "Operating Systems", "SE", "SE", "Bishop, M", "4.0",
        row = {
            'crn': row[0],
            'time': row[1],
            'course': row[2],
            'location': row[3],
            'section': row[4],
            'seats': row[5],
            'name': row[6],
            'ge': row[8],
            'professor': row[9],
            'units': row[10],
            'discussion': '',
            'discussion_location': ''
        }

        # check if crn is in the database
        cur = get_db().cursor()
        cur.execute(
            'SELECT * FROM courses WHERE crn = ?', (row['crn'],))
        # if crn exists, check the times
        rows = cur.fetchall()
        if len(rows) > 0:
            time1 = rows[0]['time'].split(' ')[-1]
            time2 = row['time'].split(' ')[-1]
            if len(time1) >= len(time2):
                # set the discussion to time2 in the database
                cur.execute(
                    'UPDATE courses SET discussion = ?, discussion_location = ? WHERE crn = ?', (row['time'], row['location'], row['crn']))
            else:
                # update the record to row
                cur.execute(
                    'UPDATE courses SET crn = ?, time = ?, course = ?, location = ?, section = ?,seats = ?, name = ?, ge = ?, professor = ?, units = ?, discussion = ?,discussion_location=? WHERE crn = ?',
                    (row['crn'], row['time'], row['course'].upper().replace(' ', ''), row['location'], row['section'], row['seats'], row['name'], row['ge'], row['professor'], row['units'], rows[0]['time'], rows[0]['location'], row['crn']))
        else:
            sections.append(row)
            # add course to database
            cur.execute(
                'INSERT INTO courses VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)', (row['crn'], row['time'], row['course'].upper().replace(' ', ''), row['location'], row['section'], row['seats'], row['name'], row['ge'], row['professor'], row['units'], row['discussion'], row['discussion_location']))
    get_db().commit()
    return sections


@app.route("/")
def home():
    return "Hello, World!"

# get course by course name


@app.route("/course/<course>")
def getCourse(course):
    section = None
    sections = getClassInfo(course)
    courses = []
    for s in sections:
        cur = get_db().cursor()
        cur.execute("SELECT * FROM courses WHERE crn=?", (s['crn'],))
        row = cur.fetchone()
        if row is None:
            continue
        else:
            # crn, time, name, location, section, title, ge, instructor, units, discussion
            if section is None or section == row['section']:
                courses.append({
                    'crn': row['crn'],
                    'time': row['time'],
                    'name': row['name'],
                    'location': row['location'],
                    'section': row['section'],
                    'title': row['course'],
                    'ge': row['ge'],
                    'instructor': row['professor'],
                    'units': row['units'],
                    'discussion': row['discussion'],
                    'discussion_location': row['discussion_location']
                })
    return Response(json.dumps(courses),  mimetype='application/json')


school = ratemyprofessor.get_school_by_name("University of California Davis")


@app.route("/professor/<professor>")
def getRMP(professor):
    prof = ratemyprofessor.get_professor_by_school_and_name(school, professor)
    if prof is not None:
        prof = {
            'name': prof.name,
            'department': prof.department,
            'difficulty': prof.difficulty,
            'rating': prof.rating,
            'would_take_again': prof.would_take_again,
            'num_ratings': prof.num_ratings,
        }
        return Response(json.dumps(prof),  mimetype='application/json')
    else:
        return Response(json.dumps({'error': 'Professor not found'}),  mimetype='application/json')


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


if __name__ == "__main__":
    app.run(debug=True)
