const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const bcrypt = require("bcrypt");
const router = express.Router();
const verifyToken = require('../routes/middleware/middleware');

// Route pour authentifier l'utilisateur et générer un token JWT
router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;
  const token =  req.headers['authorization'];
  console.log("je passe");
  console.log(token);

  
  if (token!=="notFound" && token!== undefined) {

    verifyToken(token); 
    console.log("ou alors ici ")
   
    return res.status(200).json({ message: 'Token valid' });
  }
  else{ 
    console.log("ou alors iddddddddddci ")
  if(!email){
    return res.status(400).json({ message: '"email" is required' });
  }
  if(!password){
    return res.status(400).json({ message: '"password" is required' });
  }
  // Find the user by email
  const user = await User.findOne({ email });
  // If the user doesn't exist or the password is incorrect, return an error
  if(!user){
    return res.status(401).json({ message: 'Email or password is incorrect' });
  }
  const validPassword = await bcrypt.compare(password, user.password);

  const salt = await bcrypt.genSalt(10);
  var didi = await bcrypt.hash(password, salt);
  console.log(didi)
  if (!validPassword) {
    return res.status(401).json({ message: 'Email or password is incorrect llllllalalalalalal' });
  }

  // Generate a JWT token with the user ID as payload
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  // Return the token as JSON
  res.json({ accessToken, id: user.id,
    name: user.name,
    email: user.email,
    photo: user.photo });
}
});


module.exports = router;
