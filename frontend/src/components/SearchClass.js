import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Table, Button, Form } from "react-bootstrap";
import "../styles/SearchClass.css";
function SearchClass(props) {
  const [courses, setData] = useState([]);
  const [courseName, setCourseName] = useState("");

  let onChangeCourseName = (e) => {
    setCourseName(e.target.value);
  };

  let viewCourse = () => {
    axios
      .post("/api/course", {
        course: courseName,
        section: "",
      })
      .then((res) => {
        console.log(res.data);
        if (!res.data.err) setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div className="search-class">
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Class Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Class"
            value={courseName}
            onChange={onChangeCourseName}
          />
          <Form.Text className="text-muted">
            Enter class in the form of ECS150 or crn
          </Form.Text>
        </Form.Group>
        <Button variant="primary" onClick={viewCourse}>
          Submit
        </Button>
      </Form>
      <Table striped bordered hover onClick={props.onClick}>
        {/* crn, time, name, location, section, title, ge, instructor, units, discussion */}
        {courses.length > 0 ? (
          <thead>
            <tr>
              <th>CRN</th>
              <th>Title</th>
              <th>Section</th>
              <th>Professor</th>
              <th>Units</th>
              <th>Time</th>
              <th>Location</th>
              <th>Discussion</th>
            </tr>
          </thead>
        ) : (
          <> </>
        )}
        <tbody>
          {courses.length > 0 ? (
            courses.map((course) => {
              return (
                <tr>
                  <td>{course.crn}</td>
                  <td>{course.title}</td>
                  <td>{course.section}</td>
                  <td>{course.instructor}</td>
                  <td>{course.units}</td>
                  <td>{course.time}</td>
                  <td>{course.location}</td>
                  <td>{course.discussion}</td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default SearchClass;
