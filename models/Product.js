const mongoose = require('mongoose');
const yup = require('yup');

// Définir le schéma de produit
const productSchema = new mongoose.Schema({
    name: { type: String, minlength: 3, maxlength: 15, required: true },
    price: { type: Number, required: true },
    material: { type: String, required: true },
});

const Product = mongoose.model('Product', productSchema);

const productValidationSchema = yup.object().shape({
    name: yup.string().required().min(3).max(15),
    price: yup.number().required().positive(),
    material: yup.string().required(),
});

module.exports = { Product, productValidationSchema };
