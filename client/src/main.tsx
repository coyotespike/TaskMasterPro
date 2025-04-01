import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add timeline connector styles for the schedule display
const style = document.createElement('style');
style.innerHTML = `
  .timeline-connector {
    position: absolute;
    top: 24px;
    bottom: 0;
    left: 16px;
    width: 2px;
    background-color: #d1d5db;
    z-index: 0;
  }
  @media (prefers-color-scheme: dark) {
    .timeline-connector {
      background-color: #4b5563;
    }
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
