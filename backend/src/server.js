import app from "./app.js";

const PORT = process.env.PORT || 5000;

// Démarrage du serveur Express
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
