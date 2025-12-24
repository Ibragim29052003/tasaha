import { Route, Routes } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Fragment />} />
      {/* <Route path="/" element={<Fragment />} /> */}
      {/* <Route path="/" element={<Fragment />} /> */}

      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
};

export default AppRouter;
