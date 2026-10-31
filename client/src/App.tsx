import { Route, Routes } from 'react-router-dom';
import CategoryPage from './pages/CategoryPage';
import StorefrontPage from './pages/StorefrontPage';
import StoreProductPage from './pages/StoreProductPage';

const App = () => (
  <Routes>
    <Route path="/" element={<StorefrontPage />} />
    <Route path="/categories/:slug" element={<CategoryPage />} />
    <Route path="/products/:id" element={<StoreProductPage />} />
  </Routes>
);

export default App;
