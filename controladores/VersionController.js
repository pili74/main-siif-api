const globalVariables = require('../enviroments/enviroments');

// Configuración de la base de datos Oracle
const dbConfig = {
    user: globalVariables.db_user,
    password: globalVariables.db_psw,
    connectString: globalVariables.db_connectString, // Reemplaza ORACLE_SID con el nombre de tu instancia
};

exports.obtenerVersion = async (req, res) => {

    // Retornar la  respuesta    
    return res.status(200).json("Version 1.0");
}
