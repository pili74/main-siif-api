const express = require('express');
const app = express();
const PORT = process.env.PORT || 3100;
const rutas = require('./rutas/rutas');
// Rutas del módulo de confidencialidad del Main SIIF
const confidencialidadRoutes =
    require('./rutas/confidencialidad.routes');
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

// Endpoints relacionados con el acuerdo de confidencialidad
app.use(
    '/main_api/confidencialidad',
    confidencialidadRoutes
);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});