import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AddClass.css";
import { Form, FormControl, Button } from "react-bootstrap";

function AddClass(props) {
  const [courseName, setCourseName] = useState("");
  const [section, setSection] = useState("");

  let onChangeCourseName = (e) => {
    setCourseName(e.target.value);
  };

  let onChangeSection = (e) => {
    setSection(e.target.value);
  };

  let getClass = () => {
    axios
      .post("https://unify.onrender.com/api/add", {
        course: courseName,
        section: section,
        // user_id: localStorage.getItem("user_id"),
        // user_id: "279174239972491276",
        user_id: props.user_id,
        username: props.username,
      })
      .then((res) => {
        console.log(res.data);
        // reload page
        window.location.reload();
      });
  };

  let removeClass = () => {
    axios
      .post("https://unify.onrender.com/api/remove", {
        course: courseName,
        section: section,
        user_id: props.user_id,
      })
      .then((res) => {
        console.log(res.data);
        // reload page
        window.location.reload();
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
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Section</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Section"
            value={section}
            onChange={onChangeSection}
          />
          <Form.Text className="text-muted">
            Enter class in the form of ECS150 or crn
          </Form.Text>
        </Form.Group>
        <div className="add-remove">
          <Button variant="primary" onClick={getClass}>
            Submit
          </Button>
          <Button variant="danger" onClick={removeClass}>
            Remove
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default AddClass;
