import PokemonListPage from "./PokemonListPage";
import { Routes, Route } from "react-router-dom";
import PokemondetailsPage from "./PokemonDetailsPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={<PokemonListPage />} />
      <Route path="/pokemon/:id" element={<PokemondetailsPage />} />
    </Routes>
  );
}

export default App;
