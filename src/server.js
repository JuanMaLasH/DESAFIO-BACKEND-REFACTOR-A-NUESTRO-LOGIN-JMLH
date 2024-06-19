import express from 'express';
import session from "express-session";
import handlebars from "express-handlebars";
import morgan from 'morgan';
import productRouter from './routes/product.router.js';
import cartRouter from './routes/cart.router.js';
import viewRouter from './routes/view.router.js';
import userRouter from "./routes/user.router.js";
import sessionRouter from "./routes/session.router.js";
import { errorHandler } from './middlewares/errorHandler.js';
import { initMongoDB } from './db/database.js';
import { __dirname } from "./utils.js";
import { Server } from "socket.io"; 
import MessagesDao from "./daos/mongodb/message.dao.js"; 
import ProductDao from "./daos/mongodb/product.dao.js";
import passport from 'passport';
import MongoStore from "connect-mongo";
import { initializePassport  } from "./config/passport.config.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(express.static(`${__dirname}/public`));

//SESSION
app.use(session({
  secret:"secretCoder",
  resave: true,
  saveUninitialized : true, 
  store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/ecommerce", ttl: 100000000000
  })
}))


//PASSPORT
app.use(passport.initialize());
app.use(passport.session());
initializePassport(); 

// HANDLEBARS
app.engine("handlebars", handlebars.engine());
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");

//ROUTES
app.use('/products', productRouter);
app.use('/carts', cartRouter);
app.use('/users', userRouter);
app.use('/sessions', sessionRouter);
app.use('/', viewRouter);

app.use(errorHandler);

initMongoDB();

const PORT = 8080;

const httpServer = app.listen(PORT, () => console.log(`SERVER UP ON PORT ${PORT}`));

const socketServer = new Server(httpServer);

const productServices = new ProductDao(); 
const messageServices = new MessagesDao();

socketServer.on("connection", async (socket) => {
    console.log("Un cliente conectado");
    
    const listProducts = await productServices.getAll();
    socket.emit("productos", listProducts);

    socket.on("create", async (producto) => {
      await productServices.create(producto);
      const listProducts = await productServices.getAll();
      socket.emit("productos", listProducts);
  })

    socket.on("delete", async (id) => {
        await productServices.delete(id);
        const listProducts = await productServices.getAll();
        socket.emit("productos", listProducts);
    })

    socket.on("disconnect", () => {
        console.log("Cliente desconectado");
      });
      socket.on("newUser", (usuario) => {
        console.log("usuario", usuario);
        socket.broadcast.emit("broadcast", usuario);
      });
    
      socket.on("disconnect", () => {
        console.log(`Usuario con ID : ${socket.id} esta desconectado `);
      });
    
      socket.on("message", async (info) => {
        console.log(info);
        await messageServices.createMessage(info);
        socketServer.emit("chat", await messageServices.getMessages());
      });
});