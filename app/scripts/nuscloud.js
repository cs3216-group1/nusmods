
var server_host = "http://nuscloud.jishnumohan.com";
var redirect_url = window.location.origin + "/ivlelogin.html"; //The popup window will redirect here on login
//This can be a blank page on your app as the implementation in the SDK
//will save the token and close the popup on successful auth
var app_id = "Imx6RKoPXYsl"; //As per registration
var permissions = "friends-read";

var sdk = new NUSCloud(server_host, redirect_url, app_id, permissions);
