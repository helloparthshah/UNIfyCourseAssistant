import logo from "./logo.svg";
import "./App.css";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddClass from "./components/AddClass";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/login";
import ViewClasses from "./components/ViewClasses";
import Home from "./pages/Home";
import Rating from "./components/rating";
import Header from "./components/Header";

function App() {
  return (
    <>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/view" element={<ViewClasses />} />
          <Route exact path="/rate" element={<Rating />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
