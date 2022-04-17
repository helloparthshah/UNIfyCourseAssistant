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
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/view" element={<ViewClasses />} />
          <Route path="/rate" element={<Rating />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
