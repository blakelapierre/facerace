import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Race } from "./game/Race";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Race />
    </StrictMode>,
  );
}
