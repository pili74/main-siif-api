const oracledb = require('oracledb');
const Conexion = require('../dbconexion/conexion');

/**
 * Servicio encargado de las operaciones relacionadas
 * con el acuerdo de confidencialidad del Main SIIF.
 *
 * Este archivo contiene la lógica para comunicarse
 * con los procedimientos almacenados de Oracle.
 */
class ConfidencialidadService {

    /**
     * Verifica si un operador ya aceptó
     * el acuerdo de confidencialidad.
     *
     * @param {number} opeid Identificador del operador SIIF.
     * @returns {Promise<object>} Resultado devuelto por Oracle.
     */
    async verificarConfidencialidad(opeid) {

        // Creamos el objeto que administrará la conexión Oracle.
        const conexion = new Conexion();

        try {

            // Abrimos la conexión con Oracle.
            const db = await conexion.conectar();

            // Ejecutamos el procedimiento almacenado que ya existe
            // dentro del paquete PKG_AUTH_WEB.
            const resultado = await db.execute(
                `BEGIN
                    PKG_AUTH_WEB.verificar_confid_main(
                        :opeid,
                        :aceptado,
                        :codError,
                        :menError
                    );
                 END;`,
                {
                    // Parámetro de entrada: operador que queremos consultar.
                    opeid: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.NUMBER,
                        val: Number(opeid)
                    },

                    // Oracle devolverá 1 si aceptó y 0 si no aceptó.
                    aceptado: {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.NUMBER
                    },

                    // Código funcional devuelto por el procedimiento.
                    codError: {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.NUMBER
                    },

                    // Mensaje funcional o de error devuelto por Oracle.
                    menError: {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.STRING,
                        maxSize: 500
                    }
                }
            );

            // Transformamos los parámetros OUT de Oracle
            // en un objeto sencillo para las capas superiores.
            return {
                aceptado: resultado.outBinds.aceptado,
                codError: resultado.outBinds.codError,
                menError: resultado.outBinds.menError || ''
            };

        } finally {

            // Pase lo que pase (éxito o error), cerramos la conexión.
            await conexion.closeConex();
        }
    }
}

module.exports = new ConfidencialidadService();