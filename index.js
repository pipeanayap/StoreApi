import express from 'express';
import mongoose from 'mongoose';
import conexion from './conexion.js';
import cors from 'cors';
import productosRoutes from './routes/productosRoutes.js';
import categoriasRoutes from './routes/categoriasRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import documentacionRoutes from './routes/documentacionRoutes.js';
import ejs from 'ejs';

const app = express();
app.use(cors());

app.set('view engine', 'ejs');
app.engine('ejs', ejs.__express);



mongoose.connect(conexion)
    .then(() => {
        console.log('Conectado a la base de datos')
    })
    .catch((error) => {
    console.log('Error al conectar a la base de datos')
    console.log(error)
    })

app.listen(3000, () => {
    console.log('Servidor iniciado')
});

app.use(productosRoutes);
app.use(categoriasRoutes);
app.use(usuariosRoutes);
app.use(documentacionRoutes);


