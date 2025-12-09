
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
 import './index.css'
import { ProfileProvider } from "./context/ProfileContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ProfileProvider>
    <App />
  </ProfileProvider>
);
