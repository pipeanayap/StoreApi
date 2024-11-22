import mongoose from 'mongoose';
const { Schema } = mongoose;

const productosSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    categorias: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Categoria'
        }
    ],
    imagenes: {
        type: String, // Array de URLs de imágenes
        required: false
    },
});

const Producto = mongoose.model('Producto', productosSchema, 'productos');
export default Producto;
