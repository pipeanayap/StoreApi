import express from 'express';
import bodyParser from 'body-parser';
import Producto from '../models/producto.js';
import Categoria from '../models/categoria.js';

const router = express.Router();

router.use(bodyParser.json()); // Para que pueda parsear application/json

// Obtener todos los productos
router.get('/productos', async (req, res) => {
    try {
        const productos = await Producto.find().populate('categorias', 'nombre -_id'); // Usando 'categorias'
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener productos', error });
    }
});

// Obtener un producto por ID
router.get('/productos/:id', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id).populate('categorias', 'nombre -_id'); // Usando 'categorias'
        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el producto', error });
    }
});

// Eliminar un producto por ID
router.delete('/productos/:id', async (req, res) => {
    try {
        const productoEliminado = await Producto.deleteOne({ _id: req.params.id });
        res.json(productoEliminado);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar producto', error });
    }
});

// Actualizar un producto
router.put('/productos/:id', async (req, res) => {
    try {
        const { nombre, precio, categorias, imagenes } = req.body;

        let categoriasIds;
        if (categorias) {
            categoriasIds = await Categoria.find({ nombre: { $in: categorias } }, '_id');
            if (categoriasIds.length !== categorias.length) {
                return res.status(400).json({ mensaje: 'Algunas categorías no existen en la base de datos' });
            }
        }

        const actualizacion = {
            ...(nombre && { nombre }),
            ...(precio && { precio }),
            ...(imagenes && { imagenes }),
            ...(categorias && { categorias: categoriasIds.map(cat => cat._id) }) // Usando 'categorias'
        };

        const productoActualizado = await Producto.updateOne({ _id: req.params.id }, actualizacion);
        if (productoActualizado.matchedCount === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        res.json({ mensaje: 'Producto actualizado exitosamente', productoActualizado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar producto', error });
    }
});

// Crear un producto
router.post('/productos', async (req, res) => {
    try {
        const { nombre, precio, categorias, imagenes } = req.body;

        const categoriasIds = await Categoria.find({ nombre: { $in: categorias } }, '_id');
        if (categoriasIds.length !== categorias.length) {
            return res.status(400).json({ mensaje: 'Algunas categorías no existen' });
        }

        const producto = new Producto({
            nombre,
            precio,
            categorias: categoriasIds.map(cat => cat._id), // Usando 'categorias'
            imagenes
        });

        await producto.save();
        res.json(await Producto.findById(producto._id).populate('categorias', 'nombre'));
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear producto', error });
    }
});

export default router;
