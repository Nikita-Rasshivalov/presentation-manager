import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PresentationStart } from "./pages/PresentationStart";
import { PresentationPage } from "./pages/PresentationPage";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PresentationStart />} />
        <Route
          path="/presentation/:id/:nickname"
          element={<PresentationPage />}
        />
      </Routes>
    </BrowserRouter>
  );
};
