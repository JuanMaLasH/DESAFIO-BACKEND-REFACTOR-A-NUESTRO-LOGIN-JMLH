import { Router } from 'express';
import * as controller from "../controllers/product.controllers.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const productos = await controller.getProducts();
        res.render("home", {productos:productos});
    } catch (error) {
        res.status(500).json({error: "Error interno del servidor"})
    }
})

router.get("/realtimeproducts", (req, res) => {
    res.render("realtimeproducts");
})

router.get("/messages", (req, res) => {
    res.render("messages")
})

router.get("/login", (req, res) => {
    if (req.session.login) {
        return res.redirect("/products");
    }
    res.render("login");
});
 
router.get("/register", (req, res) => {
    if (req.session.login) {
        return res.redirect("/profile");
    }
    res.render("register");
});

router.get("/profile", (req, res) => {
    if (!req.session.login) {
        return res.redirect("/login");
    }
    res.render("profile", { user: req.session.user });
    });

export default router;