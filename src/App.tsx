import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Home";
import Shop from "./pages/Shop";
import { CartProvider } from "./hooks/useCart";
import { PumpProvider } from "./context/PumpContext";

function App() {
  return (
    <PumpProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect root to /home */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            {/* Home route */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/shop" element={<Shop />} />
            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </PumpProvider>
  );
}

export default App;
