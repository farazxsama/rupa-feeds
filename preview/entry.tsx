// Single-bundle client render of the homepage, used only for the shareable
// preview build (`npm run preview:build`). Production uses the Next.js app.
import { createRoot } from "react-dom/client";
import HomePage from "@/app/page";

createRoot(document.getElementById("root")!).render(<HomePage />);
