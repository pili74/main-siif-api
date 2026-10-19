const confidencialidadService =
    require('../servicios/confidencialidad.service');

/**
 * Controlador encargado de recibir las peticiones HTTP
 * relacionadas con el acuerdo de confidencialidad.
 *
 * El controlador NO accede directamente a Oracle.
 * Para eso utiliza ConfidencialidadService.
 */
exports.verificarConfidencialidad = async (req, res) => {

    try {

        // Obtenemos el OPEID enviado por el frontend.
        const { opeid } = req.body;

       // Validamos que el OPEID haya sido informado
        // y que corresponda a un identificador numérico válido.
        if (
            opeid === undefined ||
            opeid === null ||
            opeid === '' ||
            !Number.isInteger(Number(opeid)) ||
            Number(opeid) <= 0
        ) {

    return res.status(400).json({
        aceptado: 0,
        codError: 400,
        menError: 'El OPEID es obligatorio y debe ser un número válido.'
    });
}

        // Delegamos al servicio la comunicación con Oracle.
        const resultado =
            await confidencialidadService.verificarConfidencialidad(opeid);

        // Si Oracle informa un error funcional,
        // devolvemos el resultado recibido.
        if (resultado.codError !== 0) {

            return res.status(400).json(resultado);
        }

        // La operación terminó correctamente.
        return res.status(200).json(resultado);

    } catch (error) {

        console.error(
            'Error al verificar confidencialidad:',
            error.message
        );

        // Evitamos enviar detalles internos de Oracle
        // o del servidor al frontend.
        return res.status(500).json({
            aceptado: 0,
            codError: 500,
            menError: 'Error interno al verificar la confidencialidad.'
        });
    }
};
/**
 * Registra la aceptación del acuerdo de confidencialidad
 * para el operador autenticado en el Main SIIF.
 *
 * El controlador valida los datos recibidos y delega
 * al servicio la comunicación con Oracle.
 */
exports.aceptarConfidencialidad = async (req, res) => {

    try {

        // Obtenemos del frontend el operador y el usuario
        // que están realizando la aceptación.
        const { opeid, login } = req.body;

        // Validamos que el OPEID exista y sea
        // un identificador numérico positivo.
        if (
            opeid === undefined ||
            opeid === null ||
            opeid === '' ||
            !Number.isInteger(Number(opeid)) ||
            Number(opeid) <= 0
        ) {

            return res.status(400).json({
                codError: 400,
                menError:
                    'El OPEID es obligatorio y debe ser un número válido.',
                registrado: false,
                yaAceptado: false
            });
        }

        // Validamos que también se haya informado el login.
        if (
            typeof login !== 'string' ||
            login.trim() === ''
        ) {

            return res.status(400).json({
                codError: 400,
                menError: 'El LOGIN es obligatorio.',
                registrado: false,
                yaAceptado: false
            });
        }

        // Delegamos al servicio el registro de la aceptación.
        //
        // trim() evita enviar espacios accidentales
        // al procedimiento almacenado.
        const resultado =
            await confidencialidadService.aceptarConfidencialidad(
                Number(opeid),
                login.trim()
            );

        // Si Oracle informa un error funcional,
        // devolvemos el resultado sin ocultarlo.
        if (resultado.codError !== 0) {

            return res.status(400).json(resultado);
        }

        // La aceptación fue registrada correctamente
        // o ya existía previamente.
        return res.status(200).json(resultado);

    } catch (error) {

        // El detalle técnico queda únicamente
        // registrado en el servidor.
        console.error(
            'Error al registrar confidencialidad:',
            error.message
        );

        // Al frontend enviamos un mensaje genérico
        // para no exponer información interna de Oracle.
        return res.status(500).json({
            codError: 500,
            menError:
                'Error interno al registrar la confidencialidad.',
            registrado: false,
            yaAceptado: false
        });
    }
};