const { User } = require("../model/User");
const crypto = require("crypto");
const { sanitizeUser } = require("../services/common");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "SECRET_KEY";

exports.createUser = async (req, res) => {
  try {
    console.log(`server is reach at auth controller`);
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        const user = new User({ ...req.body, password: hashedPassword, salt });
        const doc = await user.save();
        console.log(`server is reach at auth controller after crypto `);

        req.login(sanitizeUser(doc), (err) => {
          // this also calls serializer and adds to session
          if (err) {
            res.status(400).json(err);
          } else {
            const token = jwt.sign(sanitizeUser(doc), SECRET_KEY);
            res.cookie("jwt", token, {
              expires: new Date(Date.now() + 3600000),
              httpOnly: true,
            });
            res.status(201).json(token);
          }
        });

        //res.status(201).json(sanitizeUser(token))
      }
    );
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.loginUser = async (req, res) => {
  res.cookie("jwt", req.user.token, {
    expires: new Date(Date.now() + 3600000),
    httpOnly: true,
  });
  res.status(201).json(req.user.token);
};

exports.checkAuth = async (req, res) => {
  if (req.user) {
    res.json( req.user );
    
  } else {
    res.sendStatus(401)
  }
};
