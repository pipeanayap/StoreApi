import express from 'express';
import bodyParser from 'body-parser';
import Producto from '../models/producto.js';
import Categoria from '../models/categoria.js';

const router = express.Router();

router.use(bodyParser.json()); // Para que pueda parsear application/json

// Obtener todos los productos
router.get('/productos', async (req, res) => {
    try {
        const productos = await Producto.find().populate('categoriasProducto', 'nombre -_id');
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener productos', error });
    }
});

// Obtener un producto por ID
router.get('/productos/:id', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id).populate('categoriasProducto', 'nombre -_id');
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
        const { nombre, precio, categoriasProducto, imagenes } = req.body;

        let categoriasIds;
        if (categoriasProducto) {
            categoriasIds = await Categoria.find({ nombre: { $in: categoriasProducto } }, '_id');
            if (categoriasIds.length !== categoriasProducto.length) {
                return res.status(400).json({ mensaje: 'Algunas categorías no existen en la base de datos' });
            }
        }

        const actualizacion = {
            ...(nombre && { nombre }),
            ...(precio && { precio }),
            ...(imagenes && { imagenes }),
            ...(categoriasProducto && { categoriasProducto: categoriasIds.map(cat => cat._id) })
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
        const { nombre, precio, categoriasProducto, imagenes } = req.body;

        const categoriasIds = await Categoria.find({ nombre: { $in: categoriasProducto } }, '_id');
        if (categoriasIds.length !== categoriasProducto.length) {
            return res.status(400).json({ mensaje: 'Algunas categorías no existen' });
        }

        const producto = new Producto({
            nombre,
            precio,
            categoriasProducto: categoriasIds.map(cat => cat._id),
            imagenes
        });

        await producto.save();
        res.json(await Producto.findById(producto._id).populate('categoriasProducto', 'nombre'));
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear producto', error });
    }
});

export default router;
