const express = require('express');
const router = express.Router();
const { Product, productValidationSchema } = require('../models/Product');

// Route pour ajouter un produit
router.post('/add', async (req, res) => {
    try {
        await productValidationSchema.validate(req.body);
        const { name, price, material } = req.body;
        const newProduct = new Product({ name, price, material });
        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error adding product', error: error.message });
    }
});

// Route pour obtenir tous les produits
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Route pour supprimer un produit
router.delete('/delete/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

// Route pour mettre à jour un produit
router.put('/edit/:id', async (req, res) => {
    try {
        await productValidationSchema.validate(req.body);
        const { name, price, material } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, price, material },
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// Route pour filtrer les produits par nom
router.get('/filterByName/:name', async (req, res) => {
    try {
        const products = await Product.find({ name: req.params.name });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error filtering products', error: error.message });
    }
});

/// Route pour calculer le prix moyen
router.get('/averagePrice', async (req, res) => {
    try {
       
        const average = await Product.aggregate([
            {
                $group: {
                    _id: null, 
                    averagePrice: { $avg: '$price' }
                }
            }
        ]);

        if (average.length > 0) {
            res.json({ averagePrice: average[0].averagePrice });

        } else {

            res.status(404).json({ message: 'No products found', averagePrice: 0 });
        }
    } catch (error) {

        console.error('Error calculating average price:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// route pour afficher la liste des produits
router.get('/aboveAverage', async (req, res) => {
    try {
        const average = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    averagePrice: { $avg: '$price' }
                }
            }
        ]);

        console.log('Aggregation result:', average);

        if (average.length === 0 || !average[0].averagePrice) {
            return res.json({ message: 'No products found', products: [] });
        }

        const averagePrice = average[0].averagePrice;

        // Étape 2 : Trouver les produits dont le prix est supérieur à la moyenne
        const productsAboveAverage = await Product.find({ price: { $gt: averagePrice } });

        res.json({
            averagePrice: averagePrice,
            products: productsAboveAverage
        });
    } catch (error) {
        console.error('Error fetching products above average price:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});






module.exports = router;
