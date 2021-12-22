const path = require('path');
const dataSellers = require('../data/sellers.json');
const dataCustomers = require('../data/customers.json');
const fs = require('fs');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');

const pathViews = function (nameView) {
	return path.resolve(__dirname, '../views/users/' + nameView + '.ejs');
};
// ------- Desde aquí -------
function getSellers() {
	return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/sellers.json'), 'utf-8'));
}

function getCustomers() {
	return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/customers.json'), 'utf-8'));
}

function findByEmailSeller(email) {
	const allSellers = getSellers();
	const foundSeller = allSellers.find((item) => item.email === email);
	return foundSeller;
}
function findByEmailCustomer(email) {
	const allCustomers = getCustomers();
	const foundCustomer = allCustomers.find((item) => item.email === email);
	return foundCustomer;
}

function updateCustomers(customers) {
	fs.writeFileSync(path.resolve(__dirname, '../data/customers.json'), JSON.stringify(customers, null, 4));
}

function updateSellers(sellers) {
	fs.writeFileSync(path.resolve(__dirname, '../data/sellers.json'), JSON.stringify(sellers, null, 4));
}

function newSellerId() {
	let ultimo = 0;
	getSellers().forEach((seller) => {
		if (seller.id > ultimo) {
			ultimo = seller.id;
		}
	});
	return ultimo + 1;
}

function newCustomerId() {
	let ultimo = 0;
	getCustomers().forEach((seller) => {
		if (seller.id > ultimo) {
			ultimo = seller.id;
		}
	});
	return ultimo + 1;
}

const controller = {
	// Mostrar perfil de vendedor
	getSellerProfile: function (req, res) {
		res.render(pathViews('seller'), { seller: req.session.sellerLogged });
	},
	// Mostrar registro de vendedor
	getSignInSeller: function (req, res) {
		res.render(pathViews('sign-in-seller'));
	},
	// Eliminar vendedor
	deleteSeller: function (req, res) {
		const idToDelete = req.params.id;
		const sellers = getSellers();
		const newSellerList = sellers.filter((seller) => seller.id != idToDelete);
		updateSellers(newSellerList);
		// console.log(newSellerList);
		res.redirect('/');
	},
	// Mostrar perfil de comprador
	getCustomerProfile: function (req, res) {
		res.render(pathViews('customer'), { customer: res.locals.customerLogged });
	},
	// Registro de comprador
	getSignInCustomer: function (req, res) {
		res.render(pathViews('sign-in-customer'));
	},
	// Eliminar comprador
	deleteCustomer: function (req, res) {
		const idToDelete = req.params.id;
		const customers = getCustomers();
		const newCustomerList = customers.filter((customer) => customer.id != idToDelete);
		updateSellers(newCustomerList);
		res.redirect('/');
	},
	// 	Crea usuario vendedor o comprador
	addUser: function (req, res) {
		// trae los errores del form
		let errors = validationResult(req);
		// Comprueba que los datos que vienen del form, vienen ok y si sí, hace esto
		if (errors.isEmpty()) {
			// Es encapsulado en una variable el objeto usuario
			const user = {
				...req.body,
				agree_data: req.body.agree_data === undefined ? 'off' : req.body.agree_data,
				agree_terms_conditions:
					req.body.agree_terms_conditions === undefined ? 'off' : req.body.agree_terms_conditions,
				pass: bcryptjs.hashSync(req.body.pass, 10),
				pass_confirm: null,
				photo: req.file !== undefined ? req.file.filename : 'default.jpg',
			};
			let users = [];
			// separo el sign-in dependiendo del formulario que sea
			// customer, debido a que un customer no tiene user-name
			if (user.user_name === undefined) {
				user.id = newCustomerId();
				users = getCustomers();
				users.push(user);
				updateCustomers(users);
				// Seller, debido a que sólo hay dos tipos posibles
			} else {
				user.products = [];
				user.id = newSellerId();
				users = getSellers();
				users.push(user);
				updateSellers(users);
			}
			res.redirect('/users/login');
			// En caso de que hayan errores, devuelve la vista con los errores
		} else {
			if (req.body.user_name === undefined) {
				res.render(pathViews('sign-in-customer'), { errors: errors.mapped(), old: req.body });
			} else {
				res.render(pathViews('sign-in-seller'), { errors: errors.mapped(), old: req.body });
			}
		}
	},
	// Login vendedor o comprador
	getLogin: function (req, res) {
		res.render(pathViews('login'));
	},
	// Enviar los datos
	processLogin: function (req, res) {
		// validaciones
		let resultValidation = validationResult(req);
		if (resultValidation.errors.length > 0) {
			return res.render(pathViews('login'), {
				errors: resultValidation.mapped(),
				oldData: req.body,
			});
		} else {
			const userToLogCustomer = findByEmailCustomer(req.body.email);
			const userToLogSeller = findByEmailSeller(req.body.email); //buscamos los usuarios en cada DB
			req.session.isUserLogged = false;
			if (userToLogCustomer) {
				const passwordOk = bcryptjs.compareSync(req.body.pass, userToLogCustomer.pass); // Hasheo de la contraseña
				if (passwordOk) {
					delete userToLogCustomer.pass;
					req.session.customerLogged = userToLogCustomer;
					req.session.isUserLogged = true;
					// cookies para comprador
					if (req.body.remember_user) {
						res.cookie('userEmail', req.body.email, { maxAge: 1000 * 60 * 3 });
					}
					return res.redirect('/users/customer');
				}
			} else if (userToLogSeller) {
				const passwordOk = bcryptjs.compareSync(req.body.pass, userToLogSeller.pass);
				if (passwordOk) {
					delete userToLogSeller.pass;
					req.session.sellerLogged = userToLogSeller;
					req.session.isUserLogged = true;
					// cookies para vendedor
					if (req.body.remember_user) {
						res.cookie('userEmail', req.body.email, { maxAge: 1000 * 60 * 3 });
					}
					return res.redirect('/users/seller');
				}
			} else {
				res.render(pathViews('login'), {
					errors: {
						email: {
							msg: 'Las credenciales son inválidas',
						},
					},
				});
			}
		}
	},

	logout: (req, res) => {
		res.clearCookie('userEmail');
		req.session.destroy();
		return res.redirect('/');
	},
};

module.exports = controller;
