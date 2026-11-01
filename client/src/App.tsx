import { Route, Routes } from 'react-router-dom';
import CategoryPage from './pages/CategoryPage';
import FavoritesPage from './pages/FavoritesPage';
import StorefrontPage from './pages/StorefrontPage';
import StoreProductPage from './pages/StoreProductPage';
import { FavoritesProvider } from './context/FavoritesContext';

const App = () => (
  <FavoritesProvider>
    <Routes>
      <Route path="/" element={<StorefrontPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/categories/:slug" element={<CategoryPage />} />
      <Route path="/products/:id" element={<StoreProductPage />} />
    </Routes>
  </FavoritesProvider>
);

export default App;
