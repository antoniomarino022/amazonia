import express from 'express';
import { config } from 'dotenv';
import { routerUser } from './routers/userRouter';
import { routerAuth } from './routers/authRouter';
import { routerProduct } from './routers/productRouter';
import { routerOrder } from './routers/orderRouter';
import { routerCart } from './routers/cartRouter';


config();

const port = process.env.PORT || '3000';
const app = express();

// Middleware per parsare i dati JSON
app.use(express.json());


// Configura le route
app.use('/users', routerUser);
app.use('/auths', routerAuth);
app.use('/product', routerProduct);
app.use('/order', routerOrder);
app.use('/cart', routerCart);

// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
  });
  
