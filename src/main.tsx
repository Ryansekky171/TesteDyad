import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import React from "react";
import { BrowserRouter } from "react-router-dom"; // Importar BrowserRouter

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter> {/* Adicionar BrowserRouter aqui */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);