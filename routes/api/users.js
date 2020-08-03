const express = require('express');
const { check,validationResult } = require('express-validator');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const gravatar = require('gravatar');
const auth = require('../../middleware/auth');
const router = express.Router();

router.get('/test',(req,res) => {
    res.json({ msg : 'User works'});
})


//@route  POST api/users/register
//@desc   Register a user
//@access Public
router.post('/register',[ check('name','Please enter a name').not().isEmpty(),
    check('email','Please enter valid email').isEmail(),
    check('password','Please enter password with 6 or more characters').isLength({ min: 6})],
    async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array()})
    }

    const { name,email,password } = req.body;
    const avatar = gravatar.url(email, {
        s:'200',
        r:'pg',
        d:'mm'
    });

    try {

        let user = await User.findOne({ email});
        if(user){
            return res.status(400).json({ msg : "User already exists"});
        }

        user = new User({
            name,
            email,
            avatar,
            password
        })
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt);

        await user.save();
        
        const payload = {
            user:{
                id: user.id
            }
        }

        jwt.sign(payload,config.get('jwtSecret'),{
            expiresIn : 360000
        },(err,token) =>{
            if(err) throw err;
            res.json({ token })
        })

    } catch (error) {
        console.error(error.message);
        return res.status(500).send('server error');
    }
})

//@route  POST api/users/login
//@desc   login user and token
//@access Public

router.post('/login',[ check('email','Please enter valid email').isEmail(),
    check('password','Password is required').exists()],
    async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors : errors.array()})
        }
    
        const { name,email,password } = req.body
    
        try {
    
            let user = await User.findOne({ email });
            if(!user){
                return res.status(400).json({ msg : "Invalid Credentials"});
            }

            const isMatch = await bcrypt.compare(password,user.password);

            if(!isMatch){
                return res.status(400).json({ msg : 'Invalid Credentials'});
            }

            const payload = {
                user:{
                    id: user.id
                }
            }
    
            jwt.sign(payload,config.get('jwtSecret'),{
                expiresIn : 360000
            },(err,token) =>{
                if(err) throw err;
                res.json({ token })
            })

        }catch(error){
            console.error(error.message);
            return res.status(500).send('server error');
        }
    
})

//@route  GET api/users/
//@desc   get logged in user
//@access Private
router.get('/',auth,async(req,res) => {
    try {
     const user = await User.findById(req.user.id).select('-password');
     res.send(user);
        
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
})



module.exports = router