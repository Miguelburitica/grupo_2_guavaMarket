const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { productController } = require('../controllers');
const { authSellerMiddleware, validateAddItem, validateEditItem } = require('../middlewares');

//Para guardar
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.resolve(__dirname, '../../public/images'));
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	},
});

//Middleware para guardar archivos
const uploadFile = multer({ storage });

// LISTADO DE PRODUCTOS DEL VENDEDOR
router.get('/list', authSellerMiddleware, productController.getList); //agregar middleware para que solo el vendedor vea esta pestaña

// LISTADO DE PRODUCTOS DE CARA AL COMPRADOR
router.get('/catalog', productController.getCatalog);

//CREACIÓN DE PRODUCTOS //agregar middleware para que solo el vendedor vea esta pestaña
router.get('/add-item', authSellerMiddleware, productController.getAddItem);
router.post('/add-item', uploadFile.single('imagefile'), validateAddItem, productController.storeAddItem);

// EDICIÓN DE PRODUCTOS //agregar middleware para que solo el vendedor vea esta pestaña
// Mostrar el producto a editar.
router.get('/edit-item/:id', authSellerMiddleware, productController.getEditItem);
// Manda la info editada y redirige al detalle de producto.
router.post('/edit-item/:id', uploadFile.single('imagefile'), validateEditItem, productController.updateItem);

// DETALLE DE UN PRODUCTO
router.get('/detail/:id?', productController.getDetail);

//ELIMINAR PRODUCTOS //agregar middleware para que solo el vendedor vea esta pestaña
router.delete('/:id', productController.deleteItem);
// GET shopping-cart page.
router.get('/shopping-cart', productController.getShoppingCart);

module.exports = router;
