import AuthProvider from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div>Level History</div>
    </AuthProvider>
  );
}

export default App;
