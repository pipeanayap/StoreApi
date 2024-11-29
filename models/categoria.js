import mongoose from 'mongoose';
const { Schema } = mongoose;

const categoriaSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    }
});

const Categoria = mongoose.model('Categoria', categoriaSchema, 'categorias');

export default Categoria;