#!/usr/bin/python3
import random
import uuid
from bs4 import BeautifulSoup
import json
from icalendar import Event, Calendar
from flask import Flask
import requests
from flask import Flask, request, jsonify

from datetime import datetime, timedelta
from flask import Response
import ratemyprofessor

import sqlite3
from flask import g

from dotenv import load_dotenv
import os
load_dotenv()

API_KEY = os.getenv('API_KEY')

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
            'CREATE TABLE IF NOT EXISTS courses (crn TEXT, time TEXT, course TEXT, location TEXT, section TEXT, seats NUMBER, name TEXT, ge TEXT, professor TEXT, units TEXT, discussion TEXT, discussion_location TEXT,coordinates TEXT)')
        # create the students table if it doesn't exist
        cur.execute(
            'CREATE TABLE IF NOT EXISTS students (user_id TEXT,name TEXT, courses TEXT)')
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
        "SELECT * FROM courses WHERE course LIKE ? OR crn LIKE ?", (course.upper().replace(' ', ''), course.upper().replace(' ', '')))
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
                'discussion_location': row['discussion_location'],
                'coordinates': row['coordinates']
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
        coordinates = getCoordinates(row[3])
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
            'discussion_location': '',
            'coordinates': coordinates
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
                    'UPDATE courses SET crn = ?, time = ?, course = ?, location = ?, section = ?,seats = ?, name = ?, ge = ?, professor = ?, units = ?, discussion = ?,discussion_location=?,coordinates=? WHERE crn = ?',
                    (row['crn'], row['time'], row['course'].upper().replace(' ', ''), row['location'], row['section'], row['seats'], row['name'], row['ge'], row['professor'], row['units'], rows[0]['time'], rows[0]['location'], row['coordinates'], row['crn']))
        else:
            sections.append(row)
            # add course to database
            cur.execute(
                'INSERT INTO courses VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)', (row['crn'], row['time'], row['course'].upper().replace(' ', ''), row['location'], row['section'], row['seats'], row['name'], row['ge'], row['professor'], row['units'], row['discussion'], row['discussion_location'], row['coordinates']))
    get_db().commit()
    return sections

# get course by course name


@app.route("/api/course", methods=['GET', 'POST'])
def getCourse():
    # get course from body
    course = request.get_json()['course']
    section = request.get_json()['section']
    user_id = request.get_json()['user_id']
    sections = getClassInfo(course)
    print(sections)
    courses = []
    for s in sections:
        cur = get_db().cursor()
        cur.execute("SELECT * FROM courses WHERE crn=?", (s['crn'],))
        row = cur.fetchone()
        if row is None:
            continue
        else:
            # crn, time, name, location, section, title, ge, instructor, units, discussion
            if section is None or section == '' or section == row['section']:
                collisions = checkCollision(user_id, row['crn'])
                print('collisions', collisions)
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
                    'discussion_location': row['discussion_location'],
                    'coordinates': row['coordinates'],
                    'collisions': collisions
                })
    return Response(json.dumps(courses),  mimetype='application/json')

# add new class


@app.route("/api/add", methods=['GET', 'POST'])
def addCourse():
    c = None
    course = request.get_json()['course']
    section = request.get_json()['section']
    user_id = request.get_json()['user_id']
    username = request.get_json()['username']
    cur = get_db().cursor()
    cur.execute("SELECT * FROM students WHERE user_id=?", (user_id,))
    student = cur.fetchone()
    if student is None:
        cur.execute("INSERT INTO students VALUES (?, ?, ?)",
                    (user_id, username, json.dumps([])))
        get_db().commit()
        cur.execute("SELECT * FROM students WHERE user_id=?", (user_id,))
        student = cur.fetchone()
        # student = [user_id, json.dumps([])]
    studentCourses = json.loads(student['courses'])
    sections = getClassInfo(course)
    if len(sections) == 0:
        return Response(json.dumps({'error': 'No sections found'}),  mimetype='application/json')
    c = None
    for s in sections:
        print(s)
        if s['section'].lower() == section.lower():
            if s['crn'] not in studentCourses:
                c = s
                # add crn to student's list of courses
                studentCourses.append(s['crn'])
                cur.execute(
                    "UPDATE students SET courses=? WHERE user_id=?", (json.dumps(studentCourses), student['user_id']))
                get_db().commit()
                break
            else:
                return Response(json.dumps({'error': 'Course already added'}),  mimetype='application/json')
    if c is None:
        return Response(json.dumps({'error': 'No section found'}),  mimetype='application/json')
    return Response(json.dumps(c),  mimetype='application/json')


@app.route("/api/remove", methods=['GET', 'POST'])
def removeCourse():
    c = None
    course = request.get_json()['course']
    section = request.get_json()['section']
    user_id = request.get_json()['user_id']
    cur = get_db().cursor()
    cur.execute("SELECT * FROM students WHERE user_id=?", (user_id,))
    student = cur.fetchone()
    if student is None:
        return Response(json.dumps({'error': 'No student found'}),  mimetype='application/json')
    studentCourses = json.loads(student['courses'])
    sections = getClassInfo(course)
    if len(sections) == 0:
        return Response(json.dumps({'error': 'No sections found'}),  mimetype='application/json')
    c = None
    for s in sections:
        print(s)
        if s['section'].lower() == section.lower():
            if s['crn'] in studentCourses:
                c = s
                # add crn to student's list of courses
                studentCourses.remove(s['crn'])
                cur.execute(
                    "UPDATE students SET courses=? WHERE user_id=?", (json.dumps(studentCourses), student['user_id']))
                get_db().commit()
                break
            else:
                return Response(json.dumps({'error': 'Course already added'}),  mimetype='application/json')
    if c is None:
        return Response(json.dumps({'error': 'No section found'}),  mimetype='application/json')
    return Response(json.dumps(c),  mimetype='application/json')


@app.route("/api/view", methods=['GET', 'POST'])
def viewCourse():
    user_id = request.get_json()['user_id']
    cur = get_db().cursor()
    cur.execute("SELECT * FROM students WHERE user_id=?", (user_id,))
    student = cur.fetchone()
    if student is None:
        return Response(json.dumps({'error': 'Please add a class first'}),  mimetype='application/json')
    courses = json.loads(student['courses'])
    c_list = []
    for c in courses:
        cur.execute("SELECT * FROM courses WHERE crn=?", (c,))
        course = cur.fetchone()
        c_list.append({
            'crn': course['crn'],
            'time': course['time'],
            'name': course['name'],
            'location': course['location'],
            'section': course['section'],
            'title': course['course'],
            'ge': course['ge'],
            'instructor': course['professor'],
            'units': course['units'],
            'discussion': course['discussion'],
            'discussion_location': course['discussion_location'],
            'coordinates': course['coordinates'],
        })
    return Response(json.dumps(c_list),  mimetype='application/json')


def parseTimes(time):
    # Convert 10:00 - 10:50 AM, MWF to datetime objects
    if time == '' or time == 'TBA':
        return ['', '', '']
    t = time.split(',')[0]
    start, end = t.split('-')
    start = start.strip()+' '+end.strip().split(' ')[1]
    end = end.strip()
    return [start, end, time.split(',')[1].strip()]


@app.route("/api/calendar", methods=['GET', 'POST'])
def getCalendar():
    user_id = request.get_json()['user_id']
    cal = Calendar()
    cur = get_db().cursor()
    cur.execute("SELECT * FROM students WHERE user_id=?", (user_id,))
    student = cur.fetchone()
    if student is None:
        return Response(json.dumps({'error': 'No courses found'}),  mimetype='application/json')
    courses = json.loads(student['courses'])
    today = datetime.today()
    if term == '01':
        first_monday = datetime(year=today.year, day=1, month=3)
    elif term == '03':
        first_monday = datetime(year=today.year, month=3, day=28)
    else:
        first_monday = datetime(year=today.year, month=9, day=21)

    for c in courses:
        cur.execute("SELECT * FROM courses WHERE crn=?", (c,))
        course = cur.fetchone()
        times = parseTimes(course['time'])
        day = times[2][0]
        # Change first monday to first day (Can be MTWRF)
        if day == 'M':
            fm = first_monday
        elif day == 'T':
            fm = first_monday.replace(day=first_monday.day+1)
        elif day == 'W':
            fm = first_monday.replace(day=first_monday.day+2)
        elif day == 'R':
            fm = first_monday.replace(day=first_monday.day+3)
        elif day == 'F':
            fm = first_monday.replace(day=first_monday.day+4)
        start = datetime.strptime(times[0], '%I:%M %p')
        start = datetime.now().replace(year=fm.year, month=fm.month,
                                       day=fm.day, hour=start.hour, minute=start.minute)
        end = datetime.strptime(times[1], '%I:%M %p')
        end = datetime.now().replace(year=fm.year, month=fm.month,
                                     day=fm.day, hour=end.hour, minute=end.minute)
        ev = Event()
        ev.add('summary', course['course'] + ' '+course['section'] +
               ' - '+course['name']+' Lecture')
        ev.add('dtstart', start)
        ev.add('dtend', end)
        ev.add('location', course['location'])
        days = times[2]
        dlist = []
        # repeat event for each day in days
        for day in days:
            day = day.lower()
            if day == 'm':
                day = 'MO'
            elif day == 't':
                day = 'TU'
            elif day == 'w':
                day = 'WE'
            elif day == 'r':
                day = 'TH'
            elif day == 'f':
                day = 'FR'
            dlist.append(day)

            ev.add('rrule', {'freq': 'weekly',
                             'byday': dlist,
                             'count': 11*len(dlist),
                             'dtstart': start})
        cal.add_component(ev)
    return Response(cal.to_ical(),  mimetype='text/calendar')


@app.route("/api/events", methods=['GET', 'POST'])
def getEvents():
    user_id = request.get_json()['user_id']
    events = []
    cur = get_db().cursor()
    cur.execute("SELECT * FROM students WHERE user_id=?", (user_id,))
    student = cur.fetchone()
    if student is None:
        return Response(json.dumps({'error': 'No courses found'}),  mimetype='application/json')
    courses = json.loads(student['courses'])

    # date of the monday of the current week
    first_monday = datetime.today()
    while first_monday.weekday() != 0:
        first_monday = first_monday - timedelta(days=1)
    # list of colors for each course
    colors = [
        '#0099ff',
        '#009900',
        '#ff9900',
        '#ff0000',
        '#0066ff',
        '#00ccff',
    ]
    for c in courses:
        backColor = colors[courses.index(c)]
        cur.execute("SELECT * FROM courses WHERE crn=?", (c,))
        course = cur.fetchone()
        times = parseTimes(course['time'])
        days = times[2]
        # repeat event for each day in days
        for day in days:
            day = day.lower()
            if day == 'm':
                # create a datetime object for monday
                fm = first_monday
            elif day == 't':
                fm = first_monday.replace(day=first_monday.day+1)
            elif day == 'w':
                fm = first_monday.replace(day=first_monday.day+2)
            elif day == 'r':
                fm = first_monday.replace(day=first_monday.day+3)
            elif day == 'f':
                fm = first_monday.replace(day=first_monday.day+4)

            start = datetime.strptime(times[0], '%I:%M %p')
            start = datetime.now().replace(year=fm.year, month=fm.month,
                                           day=fm.day, hour=start.hour, minute=start.minute, second=0)
            end = datetime.strptime(times[1], '%I:%M %p')
            end = datetime.now().replace(year=fm.year, month=fm.month,
                                         day=fm.day, hour=end.hour, minute=end.minute, second=0)
            events.append({
                'id': c,
                'text': course['course'] + ' '+course['section'] +
                ' - '+course['name']+' Lecture',
                'start': start.isoformat().split('.')[0],
                'end': end.isoformat().split('.')[0],
                'backColor': backColor,
                'toolTip': course['course'] + ' '+course['section'] +
                ' - '+course['name']+' Lecture'
            })
    return Response(json.dumps(events),  mimetype='application/json')


def checkCollision(user_id, crn):
    cur = get_db().cursor()
    cur.execute("SELECT * FROM courses WHERE crn=?", (crn,))
    course = cur.fetchone()
    print(course['time'])
    s_times = parseTimes(course['time'])
    sd_times = parseTimes(course['discussion'])
    # returns time in the form of ['10:00 AM', '10:50 AM', 'MWF']
    collisions = []
    # check for collisions with lecture times for the student
    cur.execute("SELECT * FROM students WHERE user_id=?", (user_id,))
    student = cur.fetchone()
    if student is None:
        return Response(json.dumps({'error': 'No courses found'}),  mimetype='application/json')
    courses = json.loads(student['courses'])
    times = []
    for c in courses:
        cur.execute("SELECT * FROM courses WHERE crn=?", (c,))
        course = cur.fetchone()
        c_times = parseTimes(course['time'])
        d_times = parseTimes(course['discussion'])
        times.append(c_times)
        times.append(d_times)
    # times are in the forn of ['10:00 AM', '10:50 AM', 'MWF']
    for t in times:
        # check for collisions with lecture times
        for i in range(len(s_times[2])):
            for j in range(len(t[2])):
                if s_times[2][i] == t[2][j]:
                    # check if the times overlap
                    if (datetime.strptime(s_times[0], '%I:%M %p') <= datetime.strptime(t[1], '%I:%M %p') and
                            datetime.strptime(s_times[1], '%I:%M %p') >= datetime.strptime(t[0], '%I:%M %p')):
                        collisions.append(c)
        for i in range(len(sd_times[2])):
            for j in range(len(t[2])):
                if sd_times[2][i] == t[2][j]:
                    # check if the times overlap
                    if (datetime.strptime(sd_times[0], '%I:%M %p') <= datetime.strptime(t[1], '%I:%M %p') and
                            datetime.strptime(sd_times[1], '%I:%M %p') >= datetime.strptime(t[0], '%I:%M %p')):
                        collisions.append(c)
    return collisions


@app.route("/api/collisions", methods=['GET', 'POST'])
def getCollisions():
    # takes a crn and checks for collisions with lecture times and discussion times
    crn = request.get_json()['crn']
    user_id = request.get_json()['user_id']
    print(crn)
    collisions = checkCollision(user_id, crn)
    return Response(json.dumps(collisions),  mimetype='application/json')


@app.route("/api/recommend", methods=['GET', 'POST'])
def getRecomendations():
    # get list of students with similar courses
    user_id = request.get_json()['user_id']
    cur = get_db().cursor()
    cur.execute("SELECT * FROM students WHERE user_id=?", (user_id,))
    student = cur.fetchone()
    if student is None:
        return Response(json.dumps({'error': 'No courses found'}),  mimetype='application/json')
    courses = json.loads(student['courses'])
    # get list of students with similar courses
    cur.execute("SELECT * FROM students")
    students = cur.fetchall()
    similar_students = []
    for s in students:
        if s['user_id'] != user_id:
            # check for similar courses
            s_courses = json.loads(s['courses'])
            n_sim_courses = len(set(courses).intersection(s_courses))
            # also check for similar professors and locations
            # get list of courses for every crn in student
            s_profs = []
            s_locations = []
            for c in s_courses:
                cur.execute("SELECT * FROM courses WHERE crn=?", (c,))
                course = cur.fetchone()
                s_profs.append(course['professor'])
                s_locations.append(course['location'])

            # get list of courses for every crn in current student
            c_profs = []
            c_locations = []
            for c in courses:
                cur.execute("SELECT * FROM courses WHERE crn=?", (c,))
                course = cur.fetchone()
                c_profs.append(course['professor'])
                c_locations.append(course['location'])

            # check for similar professors
            n_sim_profs = len(set(s_profs).intersection(c_profs))
            # check for similar locations
            n_sim_locations = len(set(s_locations).intersection(c_locations))
            n_sim_courses = n_sim_courses + n_sim_profs + n_sim_locations
            if n_sim_courses > 0:
                # add to list of students with similar courses as a dict
                similar_students.append({
                    "user_id": s['user_id'],
                    "name": s['name'],
                    # make this a score out of 100
                    "n_sim_courses": n_sim_courses*100/len(courses)/3,
                })
    # sort list of students by number of similar courses
    similar_students.sort(key=lambda x: x['n_sim_courses'], reverse=True)
    # Only top 6 students are in the list
    similar_students = similar_students[:6]
    return Response(json.dumps(similar_students),  mimetype='application/json')


@app.route("/api/create_test_users", methods=['GET', 'POST'])
def createTestUsers():
    # # remove all courses
    # cur = get_db().cursor()
    # cur.execute("DELETE FROM courses")
    # get_db().commit()
    # remove all users with the username Test User
    cur = get_db().cursor()
    cur.execute("DELETE FROM students WHERE name='Test User'")
    get_db().commit()
    # creates test users with random courses and random ids
    courses = ["40593", "40581", "60527", "46253",
               "61736", "40573", "60523", "57682", "41196", "40443"]
    for i in range(0, 10):
        # user_id is similar to 279174239972491276
        user_id = str(random.randint(1000000000000000, 99999999999999999))
        courses_sample = random.sample(
            courses, random.randint(2, 5))
        courses_sample = json.dumps(courses_sample)
        cur.execute("INSERT INTO students (user_id,name, courses) VALUES (?,?, ?)",
                    (user_id, "Test User", courses_sample))
    get_db().commit()
    return Response(json.dumps({'success': 'Test users created'}),  mimetype='application/json')


def getCoordinates(query):
    query = query.split(' ')[0] + 'HALL'
    try:
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {
            "query": query,
            "location": "38.5416056137645,-121.7514480204867",
            "radius": "5000",
            "region": "US",
            "key": API_KEY,
        }
        response = requests.get(url, params=params)
        data = response.json()
        # parse location data
        location = data['results'][0]['geometry']['location']
        return json.dumps(location)
    except:
        return json.dumps({'lat': 38.53828240712879, 'lng': -121.76172941812959})


''' @app.route("/api/location", methods=['GET', 'POST'])
def getLocation():
    query = request.get_json()['query']
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": query,
        "location": "38.53828240712879, -121.76172941812959",
        "radius": "5000",
        "region": "US",
        "key": API_KEY,
    }
    response = requests.get(url, params=params)
    data = response.json()
    # parse location data
    location = data['results'][0]['geometry']['location']
    return Response(json.dumps(location),  mimetype='application/json') '''


school = ratemyprofessor.get_school_by_name("University of California Davis")


@app.route("/api/professor", methods=['GET', 'POST'])
def getRMP():
    professor = request.get_json()['professor']
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
