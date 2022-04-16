import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AddClass.css";
import { Form, FormControl, Button } from "react-bootstrap";
function Login() {
    let disc_redirect = () => {

    };
    return (
        <div className="add-login">
            <Button
          variant="primary"
          onClick={(e) => {
            disc_redirect();
          }}
        >
          Login with Discord
        </Button>
        </div>
    );
}

export default Login;
