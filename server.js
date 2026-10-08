const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const rutas = require('./rutas/rutas');
const cors = require('cors');

// Middleware para leer JSON en las peticiones
app.use(express.json());

// Ruta de prueba (GET)
app.get('/api', (req, res) => {
    res.json({ mensaje: '¡Hola! La API está funcionando correctamente 🚀' });
});

// Configuración de CORS
app.use(cors());

app.use('/main_api', rutas);


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});