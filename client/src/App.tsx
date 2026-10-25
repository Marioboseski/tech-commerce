import { Routes, Route } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductsPage />} />
    </Routes>
  );
}

export default App;