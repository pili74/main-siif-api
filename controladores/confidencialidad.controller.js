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