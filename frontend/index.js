(function () {

const clientid = "<my client id>";
const permission = "pay_with_points accounts_details_transactions customers_profiles payees personal_domestic_transfers internal_domestic_transfers external_domestic_transfers bill_payments cards onboarding reference_data";
const callback = "<my callback url>";

    $(document).ready(function () {
		$("#btnLogin" ).click(function() {
  			window.location = "https://sandbox.apihub.citi.com/gcb/api/authCode/oauth2/authorize?response_type=code&client_id=" + clientid + "&scope=" + permission + "&countryCode=SG&businessCode=GCB&locale=en_SG&state=12093&redirect_uri=" + callback;
		});
    });

} )();