const express = require('express');
const { check,validationResult } = require('express-validator');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');

router.get('/test',(req,res) => {
    res.json({ msg : 'Profile works'});
})

//@route  GET api/profile
//@desc   get the profile
//@access Private

router.get('/',auth,async (req,res) => {
    const errors = {};
    await Profile.findOne({ user:req.user.id})
    .populate('user',['name','avatar'])
    .then( profile => {
        if(!profile){
            errors.noprofile = "There is no Profile for this User";
            return res.status(404).json(errors);
        }
        res.json(profile);
    }).catch( err => {
        res.status(500).json(err);
    })
        
})


//@route  GET api/profile/all
//@desc   get all profiles
//@access Public

router.get('/all', async (req,res) => {
    const errors = {};
    await Profile.find()
    .populate('user',['name','avatar'])
    .then( profiles => {
        if(!profiles){
            errors.noprofile = "There are no profiles"
            return res.status(404).json(errors)
        }

        res.json(profiles);
    }).catch( err => {
        res.status(500).json({ error: "There are no profiles"});
    })
})

//@route  GET api/profile/handle/:handle
//@desc   get the profile by handle
//@access Public

router.get('/handle/:handle',async (req,res) => {
    const errors = {};
    await Profile.findOne({ handle:req.params.handle })
    .populate('user',['name','avatar'])
    .then( profile => {
        if(!profile){
            errors.noprofile = "There is no Profile for this User";
            return res.status(404).json(errors);
        }
        res.json(profile);
    }).catch( err => {
        res.status(500).json(err);
    })
        
})

//@route  GET api/profile/user/:user_id
//@desc   get the profile by id
//@access Public

router.get('/user/:user_id',async (req,res) => {
    const errors = {};
    await Profile.findOne({ user:req.params.user_id })
    .populate('user',['name','avatar'])
    .then( profile => {
        if(!profile){
            errors.noprofile = "There is no Profile for this User";
            return res.status(404).json(errors);
        }
        res.json(profile);
    }).catch( err => {
        res.status(500).json({ error: "User does not exists"});
    })
        
})


//@route  POST api/profile
//@desc  create profile
//@access Private

router.post('/',[auth,[check('handle','Please enter a handle').not().isEmpty(),
    check('status','Please enter status').not().isEmpty(),
    check('skills','Please enter skills').not().isEmpty()]],async (req,res) => {
    const issues = validationResult(req);
    
    if(!issues.isEmpty()){
        return res.status(400).json({ errors : issues.array()})
    }

    const profileFields = {};
    profileFields.user = req.user.id;
    const errors = {};
    const { handle,company,website,location,bio,status,githubusername,skills,linkedin,twitter,instagram } = req.body
    
    if(handle) profileFields.handle = handle ;
    if(company) profileFields.company = company ;
    if(website) profileFields.website = website ;
    if(location) profileFields.location = location ;
    if(bio) profileFields.bio = bio ;
    if(status) profileFields.status = status ;
    if(githubusername) profileFields.githubusername = githubusername;

    if( typeof skills !== "undefined"){
        profileFields.skills = skills.split(',');
    }

    profileFields.social = {};
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(twitter) profileFields.social.twitter = twitter;
    if(instagram) profileFields.social.instagram = instagram;

    await Profile.findOne({ user: req.user.id})
    .then( profile => {
        if(profile){
            //update
            Profile.findOneAndUpdate({ user:req.user.id},{$set: profileFields},{ new:true})
            .then( profile => res.json(profile))
        }else{
            //Create

            //check handle
            Profile.findOne({ handle: profileFields.handle})
            .then( profile => {
                if(profile){
                    errors.handle = 'That handle already exists';
                    res.status(400).json(errors);
                }

                new Profile(profileFields).save().then( profile => res.json(profile));
            })
        }
    })
        
})


module.exports = router