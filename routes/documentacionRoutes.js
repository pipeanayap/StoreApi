import express from 'express';
const router = express.Router();


router.get('/', async (req, res) => {
    res.render('documentacion', {title: 'Documentación'});
});

export default router;