import { Router } from "express";
const router = Router();

import { UserModel } from "../daos/mongodb/models/user.model.js";

import { createHash } from "../utils.js";
import passport  from "passport";

router.post("/", passport.authenticate("register", {
    failureRedirect: "/failedregister"
}), async (req, res) => {
    if(!req.user) {
        return res.status(400).send("Credenciales invalidas"); 
    }
    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email
    };
    req.session.login = true;
    res.redirect("/profile");
})

router.get("/failedregister", (req, res) => {
    res.send("Registro Fallido!");
})

export default router;