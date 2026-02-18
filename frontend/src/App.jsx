import Navbar from "./components/Navbar";
import AuthProvider from "./context/AuthContext";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="main-content">
        <AppRouter />
      </main>
    </AuthProvider>
  );
}

export default App;
