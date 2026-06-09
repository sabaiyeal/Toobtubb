import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import liff from "@line/liff";

liff.init({ liffId: import.meta.env.VITE_LIFF_ID }).finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
