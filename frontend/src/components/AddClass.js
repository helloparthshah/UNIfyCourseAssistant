import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AddClass.css";
import { Form, FormControl, Button } from "react-bootstrap";

function AddClass() {
  const [courses, setData] = useState({});
  const [courseName, setCourseName] = useState("");

  let onChangeCourseName = (e) => {
    setCourseName(e.target.value);
  };

  useEffect(() => {
    axios.get("/course/ECS150").then((res) => {
      console.log(res.data);
      setData(res.data[0]);
    });
  }, []);

  let getClass = (course) => {
    axios.get("/course/" + course).then((res) => {
      console.log(res.data);
    });
  };

  return (
    <div className="add-class">
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
        <Button
          variant="primary"
          onClick={(e) => {
            getClass(courseName);
          }}
        >
          Submit
        </Button>
      </Form>
    </div>
  );
}

export default AddClass;
