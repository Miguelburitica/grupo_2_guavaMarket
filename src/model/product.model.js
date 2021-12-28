const path = require('path');
const fs = require('fs');

const model = {
	getProducts: function () {
		return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/products.json'), 'utf-8'));
	},

	updateList: function (list) {
		const jsonProducts = JSON.stringify(list, null, 4);
		fs.writeFileSync(path.resolve(__dirname, '../data/products.json'), jsonProducts);
	},

	getOne: function (id) {
		let product = this.getProducts().find((item) => item.id == id);
		return product;
	},

	editProduct: function (req) {
		const products = this.getProducts();
		const id = req.params.id;
		products.forEach((product) => {
			if (product.id === id) {
				product.name = req.body.name;
				product.price = {
					kilo: parseInt(req.body.kilo),
					unidad: parseInt(req.body.unidad),
				};
				product.discount = req.body.discount;
				product.category = [req.body.category];
				req.file != undefined ? (product.image = req.file.filename) : (product.image = product.image);
				product.market = req.body.market;
			}
		});

		this.updateList(products);
	},

	newId: function () {
		let ultimo = 0;
		this.getProducts.forEach((product) => {
			if (product.id > ultimo) {
				ultimo = product.id;
			}
		});
		return ultimo + 1;
	},

	storeProducts: function (req) {
		const priceKilo = req.body.kilo;
		const priceUnidad = req.body.unidad;

		if ((priceKilo == 0 && priceUnidad > 0) || (priceKilo == null && priceUnidad > 0)) {
			wayToBuy = 1;
		} else if ((priceKilo > 0 && priceUnidad == 0) || (priceKilo > 0 && priceUnidad == null)) {
			wayToBuy = 0;
		} else if (priceKilo > 0 && priceUnidad > 0) {
			wayToBuy = 2;
		}
		const product = {
			id: this.newId(),
			name: req.body.name,
			price: {
				kilo: parseInt(req.body.kilo),
				unidad: parseInt(req.body.unidad),
			},
			discount: req.body.discount,
			category: [req.body.category],
			image: req.file.filename,
			market: req.body.market,
			seller: '',
			wayToBuy: wayToBuy,
		};

		const products = this.getProducts();
		products.push(product);
		this.updateList(products);
	},
};

module.exports = model;
