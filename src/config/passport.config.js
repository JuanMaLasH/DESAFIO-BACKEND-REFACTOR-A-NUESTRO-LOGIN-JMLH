import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import { UserModel } from "../daos/mongodb/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";


const LocalStrategy = local.Strategy;

export const initializePassport = () => {
    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
            let usuario = await UserModel.findOne({ email });
            if (usuario) {
                return done(null, false);
            }
            let nuevoUsuario = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password)
            }
            let resultado = await UserModel.create(nuevoUsuario);
            return done(null, resultado);
        } catch (error) {
            return done(error);
        }
    }))

    passport.use("login", new LocalStrategy({
        usernameField: "email"
    }, async (email, password, done) => {
        try {
            let usuario = await UserModel.findOne({ email });
            if (!usuario) {
                console.log("Este usuario no existe");
                return done(null, false);
            }
            if (!isValidPassword(password, usuario)) {
                return done(null, false);
            }
            return done(null, usuario);
        } catch (error) {
            return done(error);
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await UserModel.findById({ _id: id });
        done(null, user);
    })

    passport.use("github", new GitHubStrategy({
        clientID: "Iv23lizYbKdzooJwVIkZ",
        clientSecret: "1b4fa95524de16c77f1b3802fc9eec5267cbd869",
        callbackURL: "http://localhost:8080/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        console.log("Profile:", profile);
        try {
            let usuario = await UserModel.findOne({ email: profile._json.email });
            if (!usuario) {
                let nuevoUsuario = {
                    first_name: profile._json.name,
                    last_name: "",
                    email: profile._json.email,
                    password: ""
                }
                let resultado = await UserModel.create(nuevoUsuario);
                done(null, resultado);
            } else {
                done(null, usuario);
            }
        } catch (error) {
            return done(error);
        }
    }))
}
