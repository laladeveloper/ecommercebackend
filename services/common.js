const passport = require('passport');

exports.isAuth=(req, res, done)=> {
    return passport.authenticate('jwt')
    }
    

exports.sanitizeUser =(user) =>{
      return({id:user.id, role:user.role})
}
exports.cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies['jwt'];
    }

    // TODO : this is temprory
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MmQwM2E5Yjc5MjlmYjczZGM1MDdkOCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjk3NTA2OTA4fQ.pcXt3XXgP-ifRNTL44UouEQlSp8Pk-uBFe10vumMw2A"
    return token;
  };