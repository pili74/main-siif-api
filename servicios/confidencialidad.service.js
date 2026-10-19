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

    /**
     * Registra que un operador aceptó
     * el acuerdo de confidencialidad del Main SIIF.
     *
     * Utiliza el procedimiento institucional existente
     * PKG_CONTROLUSUARIOS.AG_INS_MENSAJE_USUARIO.
     *
     * MENSAJE_ID = 1 corresponde actualmente
     * al acuerdo de confidencialidad del Main.
     *
     * @param {number} opeid Identificador del operador SIIF.
     * @param {string} login Usuario que realiza la aceptación.
     * @returns {Promise<object>} Resultado devuelto por Oracle.
     */
    async aceptarConfidencialidad(opeid, login) {

        // Creamos el objeto que administrará la conexión Oracle.
        const conexion = new Conexion();

        try {

            // Abrimos la conexión con Oracle.
            const db = await conexion.conectar();

            /*
             * Antes de insertar volvemos a verificar si el operador
             * ya posee una aceptación para MENSAJE_ID = 1.
             *
             * Esto evita que un doble clic o una segunda solicitud
             * genere registros duplicados en MENSAJE_USUARIO.
             */
            const verificacion = await db.execute(
                `SELECT COUNT(*) AS CANTIDAD
                   FROM MENSAJE_USUARIO
                  WHERE OPE_ID = :opeid
                    AND MENSAJE_ID = 1`,
                {
                    opeid: Number(opeid)
                }
            );

            const cantidad = verificacion.rows[0][0];

            // Si ya existe una aceptación, consideramos
            // la operación satisfecha y no insertamos otra fila.
            if (cantidad > 0) {

                return {
                    codError: 0,
                    menError: '',
                    registrado: false,
                    yaAceptado: true
                };
            }

            /*
             * El operador todavía no aceptó el acuerdo.
             * Llamamos al mismo procedimiento utilizado
             * históricamente por el Main SIIF.
             */
            const resultado = await db.execute(
                `BEGIN
                    PKG_CONTROLUSUARIOS.AG_INS_MENSAJE_USUARIO(
                        :opeid,
                        :mensajeId,
                        :login,
                        :menError,
                        :codError
                    );
                 END;`,
                {
                    opeid: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.NUMBER,
                        val: Number(opeid)
                    },

                    // El acuerdo de confidencialidad actual
                    // corresponde al MENSAJE_ID = 1.
                    mensajeId: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.NUMBER,
                        val: 1
                    },

                    login: {
                        dir: oracledb.BIND_IN,
                        type: oracledb.STRING,
                        val: login
                    },

                    menError: {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.STRING,
                        maxSize: 500
                    },

                    codError: {
                        dir: oracledb.BIND_OUT,
                        type: oracledb.NUMBER
                    }
                }
            );

            const codError = resultado.outBinds.codError;
            const menError = resultado.outBinds.menError || '';

            // El procedimiento Oracle no realiza COMMIT.
            // Confirmamos la transacción únicamente cuando
            // Oracle informa que la operación fue correcta.
            if (codError === 0) {

                await db.commit();

                return {
                    codError: 0,
                    menError: '',
                    registrado: true,
                    yaAceptado: false
                };
            }

            // Ante un error funcional no dejamos cambios pendientes.
            await db.rollback();

            return {
                codError: codError,
                menError: menError,
                registrado: false,
                yaAceptado: false
            };

        } catch (error) {

            // El error se propaga al controller para que éste
            // determine la respuesta HTTP correspondiente.
            throw error;

        } finally {

            // Cerramos siempre la conexión Oracle.
            await conexion.closeConex();
        }
    }

}

module.exports = new ConfidencialidadService();