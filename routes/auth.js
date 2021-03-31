const router = require('express').Router();
const User = require('../modles/User')
const bcrypt = require('bcryptjs')
const jwt = require ('jsonwebtoken')
const {registerValidation, loginValidation} = require('../validation')


//REGISTER ------------------------------------

router.post('/register', async (req, res) => {
  // Validate data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Check if the user already exists

  const emailExist = await User.findOne({ email: req.body.email });

  if (emailExist) return res.status(400).send("Email already exists");

  //Hash the password
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  //Create a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
  });

  try {
    const savedUser = await user.save();
    res.send({user: user._id});
  } catch (error) {
    res.status(400).send(err);
  }
})


//LOGIN ---------------------------------------
router.post('/login', async (req, res) => {

  // Validate data
  const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);


    //Check if the user exists

  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send("Email does not exists");
    
    //PASSWORD IS CORRECT

    const validatePassword = await bcrypt.compare(req.body.password, user.password)

    if (!validatePassword) return res.status(400).send('Invalid password')

    //Create and assign a token

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
    res.header('auth-token', token).send(token)


})




module.exports = router