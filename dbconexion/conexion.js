const oracledb = require('oracledb');
const globalVariables = require('../enviroments/enviroments');

/**
 * Clase responsable únicamente de administrar
 * la conexión con la base de datos Oracle.
 *
 * Las consultas y reglas de negocio NO deben
 * implementarse en este archivo.
 */
class Conexion {

    constructor() {

        // La conexión todavía no está abierta.
        this.conex = null;
    }

    /**
     * Abre una conexión con Oracle utilizando
     * la configuración definida para el ambiente.
     */
    async conectar() {

        try {

            this.conex = await oracledb.getConnection({
                user: globalVariables.db_user,
                password: globalVariables.db_psw,
                connectString: globalVariables.db_connectString
            });

            console.log('Conexión establecida con Oracle');

            return this.conex;

        } catch (error) {

            console.error(
                'Error al conectar con Oracle:',
                error.message
            );

            throw error;
        }
    }

    /**
     * Cierra la conexión Oracle si se encuentra abierta.
     */
    async closeConex() {

        if (!this.conex) {
            return;
        }

        try {

            await this.conex.close();

            console.log('Conexión cerrada');

            this.conex = null;

        } catch (error) {

            console.error(
                'Error al cerrar la conexión Oracle:',
                error.message
            );

            throw error;
        }
    }
}

module.exports = Conexion;