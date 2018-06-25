var express = require('express');
var router = express.Router();
var myPostBoxController = require('./controllers/my_post_box');
var apiMyPostBoxController = require('./controllers/api_my_post_box');
var validateRequestModule = require('./modules/validate.request.module');

// application -------------------------------------------------------------

router.get('/api/token', function (req, res) {
    // this method is only for localhost
    validateRequestModule.setPOBoxToken(res, req.query.accountPKID, req.query.lang);
    //res.status(200).send();
    res.status(200).send({
        tokenset: 'done'
    });
});
router.use('/api/mypobox/', validateRequestModule.validateRequest);

router.post('/mypobox', function (req, res, next) {
    //there are no pre requirement for calling this url
    //req.body.uiroute = 'mypobox';
    myPostBoxController.handler(req, res, next);
});

router.post('/', function (req, res, next) {
    //there are no pre requirement for calling this url
    myPostBoxController.handler(req, res, next);
});

router.get('/', function (req, res, next) {
    if (req.query.page == 'paymentreceipthandler') {
        var token = decodeURIComponent(req.query.token);
        apiMyPostBoxController.validateToken(token, function (data) {
            if (data.isValid) {
                req.body.route = 'payment';
                req.body.paymentid = data.paymentid;
                req.body.suid = data.accountid;
                req.body.lang = data.lang || 'en';
                myPostBoxController.paymentReceiptHandlerView(req, res, next);
            } else {
                myPostBoxController.handler(req, res, next);
            }
        });
    } else {
        myPostBoxController.handler(req, res, next);
    }
});

router.post('/paymenthandler/:accountPkId', function (req, res, next) {
    //there are no pre requirement for calling this url
    myPostBoxController.handlePaymentResponse(req, res, next);
});

module.exports = router;