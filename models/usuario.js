import mongoose from 'mongoose';
const { Schema } = mongoose;

const usuarioSchema = new Schema({
    correo: {
        type: String,
        required: true
    },
    contrasena: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    direccionEntrega: {
        calle: { type: String },
        numero: { type: String },
        colonia: { type: String },
        ciudad: { type: String },
        estado: { type: String },
        codigoPostal: { type: String }
    },
    roles: {
        type: [String], // Ejemplo: ['cliente', 'admin']
        default: ['cliente']
    },
    activo: {
        type: Boolean,
        default: true
    },
    facturacion: {
        numeroCuenta: { type: String },
        banco: { type: String },
        metodoPago: { type: String }
    }
});

const Usuario = mongoose.model('Usuario', usuarioSchema, 'usuarios');
export default Usuario;
