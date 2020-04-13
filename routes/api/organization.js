const router = require('express').Router();
const jwt = require('jsonwebtoken');
let Organization = require('../../models/org.model');
let Admin = require('../../models/admin.model');
let Shift = require('../../models/shift.model');

router.route('/orgs/:orgName').get((req, res) => {
    Organization.findOne({orgName: req.params.orgName})
    //.then(volunteers => res.json(volunteers))
    //.catch(err => res.status(400).json('Uhoh, error while retrieving volunteers: ' + err));
});

//not implemented, needs work. This will return list of volunteers associated with that organization
router.route('/').get((req, res) => {
    jwt.verify(req.token, 'secretkey123', (err, authData) => {
        if(err) {
            res.status(403).json(`User not logged in.`)
        } else {
            res.status(200).json(authData)
        }
    });
    // Organization.find({}, function(err, orgs) {
    //     var orgsList = {};
    //     res.render('/orgs', {orgs: orgs});
    // });
    
});

router.route('/test').get((req, res) => {
    res.status(200).json("hello")
    // Organization.find({}, function(err, orgs) {
    //     var orgsList = {};
    //     res.render('/orgs', {orgs: orgs});
    // });
    
});

router.route('/orgs/:orgName').delete((req, res) => {
    Organization.findOneAndDelete({orgName: req.params.orgName})
    .then(() => res.json('Success, organization deleted'))
    .catch(err => res.status(400).json('Uhoh, error while deleting organization: ' + err));
});

router.route('/').post((req, res) => {
    const volunteers = req.body.volunteers;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const organization = req.body.organization;

    const newShift = new Shift({volunteers, startTime, endTime, organization});

    newShift.save()
    .then(() => 
    {
        console.log(newShift);
        res.json('Success, new shift created')
    })
    .catch(err => res.status(400).json('Uhoh, error while adding new shift: ' + err));
});

module.exports = router;