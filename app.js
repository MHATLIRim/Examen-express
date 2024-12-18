const express=require('express');
const mongoose=require('mongoose');
const bodyParser = require ('body-parser') ;
const http = require('http') ;
const socketIo = require('socket.io');


const productRoutes= require ('./routes/product');   
const {Product} =require ('./models/Product');       

const app =express();
const server =http.createServer(app);
const io= socketIo(server);
const cors = require('cors');

mongoose.connect('mongodb://localhost:27017/productDB')    
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Connection error', err);
  });


  app.use(bodyParser.json()) ;
  app.use('/products' , productRoutes);    
  app.use(cors());

  
  app.set('view engine' , 'twig') ;
  app.set ('views' , './views');


   
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('getAvailableProducts', async () => {   
      try {
        // Compter les produits où "available" est égal à true
        const availableProductsCount = await Product.countDocuments({ available: true });       
        socket.emit('availableProductsCount', availableProductsCount);
      } catch (error) {
        console.error('Error fetching available products count:', error.message);
        socket.emit('error', 'Error fetching available products count'); 
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
});



  app.get('/', (req, res) => {
    res.render('index');
  });
  
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });