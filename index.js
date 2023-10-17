// following dependcies should be installed by npm i
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");

// following dependencies from the my code constants 
const { createProduct } = require("./controller/Product");
const productsRouter = require("./routes/Products");
const categoriesRouter = require("./routes/Categories");
const brandsRouter = require("./routes/Brands");
const usersRouter = require("./routes/Users");
const authRouter = require("./routes/Auth");
const cartRouter = require("./routes/Cart");
const ordersRouter = require("./routes/Order");
const { User } = require("./model/User");
const { isAuth, sanitizeUser } = require("./services/common");

// this server can be called the express js to make a server
const server = express();
const SECRET_KEY = 'SECRET_KEY';
// JWT  options
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = SECRET_KEY; //TODO: secret key must in environmental variable
//middlewares
server.use(
    session({
        secret: "keyboard cat",
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    // store: new SQLiteStore({ db: "sessions.db", dir: "./var/db" }),
  })
);
server.use(passport.authenticate("session"));
server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],credentials: true, origin: "http://localhost:3000"
  })
);
server.use(cookieParser());
server.use(express.json()); // to parse req.body
server.use("/products",productsRouter.router);
server.use("/categories", categoriesRouter.router);
server.use("/brands", brandsRouter.router);
server.use("/users", usersRouter.router);
server.use("/auth", authRouter.router);
server.use("/cart",  cartRouter.router);
server.use("/orders", isAuth(), ordersRouter.router);

// passport strategies
// local strateg is as follow
passport.use("local",
  new LocalStrategy({usernameField: "email"},async function (email, password, done) {
    // by defatult from passport username is use . in my case its email
    try {
      const user = await User.findOne({ email: email }).exec();
      if (!user) {
        done(null, false, { message: "invalid credentials" }); // for safety we give same error message in wrong email and pasword
      }
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            return done(null, false, { message: "invalid credentials" });
          }
          const token = jwt.sign(sanitizeUser(user), SECRET_KEY);

          done(null, {token} ); // this line is sending to serialize
        }
      );
      // TODO: this is just temporary, we will use strong password auth
      console.log(`this is user from index passport local strategy ${user}`);
    } catch (err) {
      done(err);
    }
  })
);

// jwt strategy
passport.use("jwt", new JwtStrategy(opts, async function(jwt_payload, done) {
   console.log(`this is payload in jwt strategy in index.js ${jwt_payload}`);
   try {
    const user =  User.findById(jwt_payload.id)
    if (user) {
        return done(null, user); // this function is calling serializer
    } else {
        return done(null, false);
        // or you could create a new account
    }
   } catch (error) {
    return done(err, false);
   } 
        
   
}));
//serialize and deserialize
// this can be create a session when req.user is called by a callback
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    console.log(`this is user from index passport serialize ${user}`);

    return cb(null, { id: user.id, role: user.role });
  });
});
//this can be create be create a seesion when req.user called by authenticated request
passport.deserializeUser(function (user, cb) {
  console.log("de-serialize", user);
  process.nextTick(function () {
    return cb(null, user);
  });
});

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");
  console.log("database connected");
}


server.listen(8080, () => {
  console.log(`server started  on the port 8080`);
});
