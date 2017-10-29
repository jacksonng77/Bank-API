//app stuff
const client_id = "<my client id>";
const client_secret = "<my secret key>";
const callback = "<my callback url>";
const exchangerate = 1.45;

// Basic Setup
var http     = require('http'),
	express  = require('express'),
	mysql    = require('mysql'),
	parser   = require('body-parser'),
	Client 	 = require('node-rest-client').Client,
    uuidv1 = require('uuid/v1'),
    _ = require('lodash');

// Setup express
var app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.set('port', process.env.PORT || 5000);

// Set default route
app.get('/', function (req, res) {
	res.send('<html><body><p>Welcome to Bank API Wrapper</p></body></html>');
});

// Endpoint: http://127.0.0.1:5000/confirmbuy
app.post('/confirmbuy', function (req,res) {
	var response = [];
 	var client = new Client();
	var myuuid = uuidv1();

	if (typeof req.body.access !== 'undefined' && typeof req.body.controlFlowId !== 'undefined'){
		var access = "Bearer " + req.body.access;
		var controlFlowId = req.body.controlFlowId;
    
    	var args = {
        	data:{"controlFlowId":controlFlowId}, 
        	headers:{ "Authorization":access,"uuid":myuuid,"Accept":"application/json","client_id":client_id,"Content-Type":"application/json" } 
        }; 
    	
    	client.registerMethod("jsonMethod", "https://sandbox.apihub.citi.com/gcb/api/v1/moneyMovement/externalDomesticTransfers", "POST"); 
    	client.methods.jsonMethod(args, function (citidata, citiresponse) { 
			res.setHeader('Content-Type', 'application/json');
    		res.status(200).send(JSON.stringify(citidata));
        }); 

    	client.on('error', function(err) {
			res.setHeader('Content-Type', 'application/json');
    		res.status(400).send(JSON.stringify({'result' : 'error', 'msg' : 'unauthorized access'}));
        });
  	} 
	else {
		res.setHeader('Content-Type', 'application/json');
    	res.status(400).send(JSON.stringify({'result' : 'error', 'msg' : 'Please fill required details'}));
	}
});

// Endpoint: http://127.0.0.1:5000/buytoken
app.post('/buytoken', function (req,res) {
	var response = [];
 	var client = new Client();
	var myuuid = uuidv1();

	if (typeof req.body.access !== 'undefined' && typeof req.body.token !== 'undefined' && typeof req.body.accountId !== 'undefined' && typeof req.body.payeeId !== 'undefined'){
		var access = "Bearer " + req.body.access;
 		var token = req.body.token;
    	var accountId = req.body.accountId;
    	var payeeId = req.body.payeeId;
    
		//Assuming 1 token = SGD10
    	var amount = token * exchangerate;
    
		var args = {
    		data:	{"sourceAccountId":accountId,"transactionAmount":amount,"transferCurrencyIndicator":"SOURCE_ACCOUNT_CURRENCY","payeeId":payeeId,"chargeBearer":"BENEFICIARY","paymentMethod":"GIRO","fxDealReferenceNumber":"","remarks":"Fund Transfer","transferPurpose":"CREDIT_CARD_PAYMENT"},
    		headers:{ "Authorization":access,"uuid":myuuid,"Accept":"application/json","client_id":client_id,"Content-Type":"application/json" } 
		};

    	client.registerMethod("jsonMethod", "https://sandbox.apihub.citi.com/gcb/api/v1/moneyMovement/externalDomesticTransfer/preprocess", "POST");
		client.methods.jsonMethod(args, function (citidata, citiresponse) {
			res.setHeader('Content-Type', 'application/json');
    		res.status(200).send(JSON.stringify(citidata));
		});
    
    	client.on('error', function(err) {
			res.setHeader('Content-Type', 'application/json');
    		res.status(400).send(JSON.stringify({'result' : 'error', 'msg' : 'unauthorized access'}));
        });
  	} 
	else {
		res.setHeader('Content-Type', 'application/json');
    	res.status(400).send(JSON.stringify({'result' : 'error', 'msg' : 'Please fill required details'}));
	}
});

// Endpoint: http://127.0.0.1:5000/payee
app.post('/payees', function (req,res) {
	var response = [];
 	var client = new Client();
	var myuuid = uuidv1();

	if (typeof req.body.access !== 'undefined'){
		var access = "Bearer " + req.body.access;
 		var args = {
			headers:{ "Authorization":access,"uuid":myuuid,"Accept":"application/json","client_id":client_id} 
		};

    	client.registerMethod("jsonMethod", "https://sandbox.apihub.citi.com/gcb/api/v1/moneyMovement/payees?paymentType=EXTERNAL_DOMESTIC", "GET");
		client.methods.jsonMethod(args, function (citidata, citiresponse) {
			res.setHeader('Content-Type', 'application/json');
    		res.status(200).send(JSON.stringify(citidata));
        });

    	client.on('error', function(err) {
			res.setHeader('Content-Type', 'application/json');
    		res.status(400).send(JSON.stringify({'result' : 'error', 'msg' : 'unauthorized access'}));
        });
  	} 
	else {
		res.setHeader('Content-Type', 'application/json');
    	res.status(400).send(JSON.stringify({'result' : 'error', 'msg' : 'Please fill required details'}));
	}
});

// Endpoint: http://127.0.0.1:5000/deposits
app.post('/deposits', function (req,res) {
	var response = [];
 	var client = new Client();
	var myuuid = uuidv1();

	if (typeof req.body.access !== 'undefined'){
		var access = "Bearer " + req.body.access;
 
		var args = {
	    	headers:{ "Authorization":access,"uuid":myuuid,"Accept":"application/json","client_id":client_id} 
		};

		client.registerMethod("jsonMethod", "https://sandbox.apihub.citi.com/gcb/api/v1/accounts", "GET");
		client.methods.jsonMethod(args, function (citidata, citiresponse) {
        	var cloneObj;
        	if (typeof citidata != 'undefined'){
            	cloneObj = _.cloneDeep(citidata);

            	if (cloneObj.hasOwnProperty('accountGroupSummary')){
					cloneObj.accountGroupSummary= cloneObj.accountGroupSummary.filter(function(item) {
   						return item.accountGroup === 'SAVINGS_AND_INVESTMENTS';
					});
            
            		cloneObj = cloneObj.accountGroupSummary[0].accounts;
					res.setHeader('Content-Type', 'application/json');
    				res.status(200).send(JSON.stringify(cloneObj));
                }
            	else {
					res.setHeader('Content-Type', 'application/json');
    				res.status(400).send(JSON.stringify({'result' : 'error', 'msg' : 'token expired'}));                	
                }
            }
		});

    	client.on('error', function(err) {
			res.setHeader('Content-Type', 'application/json');
    		res.status(400).send(JSON.stringify({'result' : 'error', 'msg' : 'unauthorized access'}));
        });
  	} 
	else {
		res.setHeader('Content-Type', 'application/json');
    	res.status(400).send(JSON.stringify({'result' : 'error', 'msg' : 'Please fill required details'}));
	}
});

// Endpoint: http://127.0.0.1:5000/authorize
app.post('/authorize', function (req,res) {
	var response = [];
 	var client = new Client();

	if (typeof req.body.code !== 'undefined' && typeof req.body.state !== 'undefined' ){
		var code = req.body.code, state = req.body.state;
 
		//conversion to base64 because citi api wants it this way
    	var authorization = "Basic " + Buffer.from(client_id + ":" + client_secret).toString('base64');

    	var args = {
			data:{"grant_type":"authorization_code","code":code,"redirect_uri":callback},
			headers:{"Authorization":authorization,"Content-Type":"application/x-www-form-urlencoded"} 
		};

    	//get access and refresh token
    	var request = client.post("https://sandbox.apihub.citi.com/gcb/api/authCode/oauth2/token/sg/gcb", args, function (citidata, citiresponse) {
        	if (typeof citidata != 'undefined'){
            	console.log(citidata);
				res.setHeader('Content-Type', 'application/json');
    			res.status(200).send(JSON.stringify(citidata));
            }
		});
    
    	client.on('error', function(err) {
			res.setHeader('Content-Type', 'application/json');
    		res.status(400).send(JSON.stringify({'result' : 'error', 'msg' : 'unauthorized access'}));
        });
  	} 
	else {
		res.setHeader('Content-Type', 'application/json');
    	res.status(400).send(JSON.stringify({'result' : 'error', 'msg' : 'Please fill required details'}));
	}
});

// Create server
http.createServer(app).listen(app.get('port'), function(){
	console.log('Server listening on port ' + app.get('port'));
});