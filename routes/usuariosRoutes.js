import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import Usuario from '../models/usuario.js';

const router = express.Router();

router.use(bodyParser.json());

router.get('/usuarios', async (req, res) => {
    Usuario.find()
        .then((usuarios) => {
            res.json(usuarios);
        })
        .catch((error) => {
            console.error("Error al obtener usuarios:", error); // Log de error
            res.send(error);        
        });
});

router.get('/usuarios/:correo', async (req, res) => {
    Usuario.findOne({ correo: req.params.correo })
        .then((usuario) => {
            if (!usuario) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }
            res.json(usuario);
        })
        .catch((error) => {
            console.error("Error al obtener usuario:", error); // Log de error
            res.status(500).send(error);
        });
})


// Cambiar "activo" a false en lugar de eliminar
router.delete('/usuarios/:id', async (req, res) => {
    Usuario.updateOne({ _id: req.params.id }, { $set: { activo: false } })
        .then((resultado) => {
            if (resultado.matchedCount === 0) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }
            res.json({ mensaje: 'Usuario marcado como inactivo exitosamente' });
        })
        .catch((error) => {
            console.error("Error al actualizar usuario a inactivo:", error); // Log de error
            res.status(500).send(error);
        });
});


router.put('/usuarios/:id', (req, res) => {
    Usuario.updateOne({ _id: req.params.id }, req.body)
        .then((usuario) => {
            res.json(usuario);
        })
        .catch((error) => {
            console.error("Error al actualizar usuario:", error); // Log de error
            res.send(error);
        });
});

router.post('/usuarios', async (req, res) => {
    const { correo, contrasena, telefono, direccionEntrega, roles, facturacion } = req.body;

    // Verificar si ya existe un usuario con el correo proporcionado
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
        return res.status(400).json({ mensaje: 'Ya existe un usuario con ese correo' });
    }

    try {
        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10); // Creamos el salt
        const hashedPassword = await bcrypt.hash(contrasena, salt); // Hasheamos la contraseña

        // Crear el nuevo usuario con los datos recibidos en la solicitud
        const usuario = new Usuario({
            correo,
            contrasena: hashedPassword, // Asignamos la contraseña hasheada
            telefono,
            direccionEntrega,
            roles: roles || ['cliente'], // Si no se especifican roles, se asigna 'cliente' por defecto
            facturacion,
            activo: true // Establecemos el usuario como activo por defecto
        });

        // Guardamos el usuario en la base de datos
        await usuario.save();

        // Respondemos con el usuario creado
        res.json(usuario);
    } catch (error) {
        console.error("Error al crear usuario:", error); // Log de error
        res.status(400).send(error);
    }
});


export default router;

