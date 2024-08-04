const {body}=require('express-validator');
module.exports=[
    body('title').trim().isLength({min:3}).withMessage('the minimum lenght is 3'),
    body('content').trim().isLength({min:3}).withMessage('the minimum lenght is 3'),
]