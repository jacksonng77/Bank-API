(function () {

	var code;
	var state;
	var access_token;
	var refresh_token;
	var accounts;
	var tokenpayees;

	//source: https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
	function getUrlParameter(sParam) {
    	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        	sURLVariables = sPageURL.split('&'),
        	sParameterName,
        	i;

    	for (i = 0; i < sURLVariables.length; i++) {
        	sParameterName = sURLVariables[i].split('=');

        	if (sParameterName[0] === sParam) {
           		return sParameterName[1] === undefined ? true : sParameterName[1];
        	}
    	}
	}

	//source: https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript
	function format2(n, currency) {
    	return currency + " " + n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
	}	

	function listaccounts(accounts){
    	var myhtml = "";
    
    	var numaccounts = Object.keys(accounts).length;
    
    	for (var name in accounts){
        	var accounttype = Object.keys(accounts[name])[0];

         	myhtml = "";
        	myhtml += '<div class="col-md-4">';
        	myhtml += '<div class="panel panel-primary">';
        	myhtml += '<div class="panel-heading">' + accounts[name][accounttype].productName + '</div>';
        	myhtml += '<div class="panel-body">' + format2(accounts[name][accounttype].currentBalance, "$") + '</div>';
        	myhtml += '</div>';
        	myhtml += '</div>';
       		$("#accounts_list").append(myhtml);
        }
     }

	function setup(code, state){
    	//now call my authorization wrapper with the code to get an access and refresh token
        var JSONObject = {
            "code": code,
            "state": state
        };
    
        $.ajax({
            url: "https://myserver.me/authorize/",
            type: 'POST',
            data: JSONObject,
            dataType: 'json',
            contentType: "application/x-www-form-urlencoded",
            success: function (arr) {
            	if (arr.hasOwnProperty('msg')){
                 	$("#authorization").html("Cannot get token.");	
                }
            	else {
                	access_token = arr.access_token;
                	refresh_token = arr.refresh_token;
                	localStorage.setItem("access_token", access_token);
                	localStorage.setItem("refresh_token", refresh_token);
             		getaccounts(localStorage.getItem("access_token"));      
                	getpayees(localStorage.getItem("access_token"));
                }
            },
            error: function () {
                alert("Server is down (setup)");
                localStorage.setItem("access_token", "");
                localStorage.setItem("refresh_token", "");
            }
        });
    }

	function listpayees(payees){
    	for (var name in payees.payeeList){
        	var payeeId = payees.payeeList[name].payeeId;
        	var payeeName = payees.payeeList[name].payeeName;

        	$('#selPayee').append($('<option>', {
    			value: payeeId,
    			text: payeeName
			}));
        }
    }

	function getpayees(mytoken){
        var JSONObject = {
            "access": mytoken
        };

        $.ajax({
            url: "https://myserver.me/payees",
            type: 'POST',
            data: JSONObject,
            dataType: 'json',
            contentType: "application/x-www-form-urlencoded",
            success: function (arr) {
            	if (arr.hasOwnProperty('msg')){
                 	$("#authorization").html("Cannot get account.");	
                }
            	else {
                	tokenpayees = arr;
                	listpayees(arr);
                }
            },
            error: function () {
                alert("Server is down (getpayee)");
                localStorage.setItem("access_token", "");
                localStorage.setItem("refresh_token", "");
            }
        });
    }	

	function getaccounts(mytoken){
        var JSONObject = {
            "access": mytoken
        };

        $.ajax({
            url: "https://myserver.me/deposits/",
            type: 'POST',
            data: JSONObject,
            dataType: 'json',
            contentType: "application/x-www-form-urlencoded",
            success: function (arr) {
            	if (arr.hasOwnProperty('msg')){
                 	$("#authorization").html("Cannot get account.");	
                }
            	else {
                	accounts = arr;
                	listaccounts(accounts);
                }
            },
            error: function () {
                alert("Server is down (getaccounts)");
                localStorage.setItem("access_token", "");
                localStorage.setItem("refresh_token", "");
            }
        });
    }

	function confirmbuy(mytoken, controlFlowId){
        var JSONObject = {
            "access": mytoken,
        	"controlFlowId": controlFlowId
        };
    
    	$.ajax({
            url: "https://myserver.me/confirmbuy",
            type: 'POST',
            data: JSONObject,
            dataType: 'json',
            contentType: "application/x-www-form-urlencoded",
            success: function (arr) {
            	if (arr.hasOwnProperty('msg')){
                 	$("#authorization").html("Cannot confirm");	
                }
            	else {
					$("#authorization").html("Done");		
                }
            },
            error: function () {
                alert("Server is down (confirmbuytoken)");
                localStorage.setItem("access_token", "");
                localStorage.setItem("refresh_token", "");
            }
        });    	
    }

	function buy(mytoken){
       	var payee = $('#selPayee').find(":selected").val();
		var tokentobuy = $("#txtToken").val();
    	var mtp = JSON.parse(JSON.stringify(tokenpayees));
    
    	mtp.payeeList = mtp.payeeList.filter(function(item) {
   			return item.payeeId === payee;
		});
    
    	var buyaccountId = mtp.payeeList[0].accountId;

        var JSONObject = {
            "access": mytoken,
        	"token":tokentobuy,
        	"accountId":buyaccountId,
        	"payeeId":payee
        };
    
    	$.ajax({
            url: "https://myserver.me/buytoken",
            type: 'POST',
            data: JSONObject,
            dataType: 'json',
            contentType: "application/x-www-form-urlencoded",
            success: function (arr) {
            	if (arr.hasOwnProperty('msg')){
                 	$("#authorization").html("Cannot buy");	
                }
            	else {
                	BootstrapDialog.confirm('Are you sure you wish to buy the tokens?', function(result){
            			if(result) {
                        	$('#accounts_list').empty(); //empty the division (lazy way. I should just update the sections for each account instead)
                        	getaccounts(localStorage.getItem("access_token"));
                        	confirmbuy(mytoken, arr.controlFlowId);
            			}
        			});
                }
            },
            error: function () {
                alert("Server is down (buytoken)");
                localStorage.setItem("access_token", "");
                localStorage.setItem("refresh_token", "");
            }
        });
    }

    $(document).ready(function () {
    	$("#btnBuy").click(function() {
  			buy(localStorage.getItem("access_token"));
		});
    
    	if (!localStorage.getItem("access_token")) {
			setup(getUrlParameter("code"),  getUrlParameter("state"));
    	}
    	else {
        	getaccounts(localStorage.getItem("access_token"));      
            getpayees(localStorage.getItem("access_token"));        
        }
    });
} )();