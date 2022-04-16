import logo from "./logo.svg";
import "./App.css";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Test from "./components/Test";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Test />}>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
