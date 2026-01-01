import { Route, Routes, Navigate } from "react-router-dom";
import WomenPage from "@/pages/WomenPage";
import MenPage from "@/pages/MenPage";
import ChildrenPage from "@/pages/ChildrenPage";
import AboutPage from "@/pages/AboutPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/women" replace />} />
      <Route path="/women" element={<WomenPage />} />
      <Route path="/men" element={<MenPage />} />
      <Route path="/children" element={<ChildrenPage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
};

export default AppRouter;
