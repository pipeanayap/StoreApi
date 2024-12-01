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
    const { correo, contrasena, telefono, direccionEntrega, facturacion } = req.body;

    try {
        // Verificar si ya existe un usuario con el correo proporcionado
        const usuarioExistente = await Usuario.findOne({ correo });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'Ya existe un usuario con ese correo' });
        }

        // Clasificar el rol basado en el correo
        const rol = correo.endsWith('@admin.com') ? 'admin' : 'usuario';

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        // Crear el nuevo usuario con los datos recibidos en la solicitud
        const usuario = new Usuario({
            correo,
            contrasena: hashedPassword,
            telefono,
            direccionEntrega: direccionEntrega || {}, // Si no se proporciona, asignar un objeto vacío
            facturacion: facturacion || {}, // Si no se proporciona, asignar un objeto vacío
            roles: [rol], // Asignar el rol automáticamente
            activo: true
        });

        // Guardamos el usuario en la base de datos
        await usuario.save();

        // Respondemos con el usuario creado
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente.', usuario });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ mensaje: 'Error interno al registrar el usuario.' });
    }
});


// Ruta para inicio de sesión
router.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // Buscar usuario por correo
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Verificar la contraseña
        const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!esValida) {
            return res.status(401).json({ mensaje: "Contraseña incorrecta" });
        }

        // Devolver el rol del usuario
        res.status(200).json({ mensaje: "Inicio de sesión exitoso", rol: usuario.roles[0] });
    } catch (error) {
        console.error("Error en inicio de sesión:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});


export default router;

