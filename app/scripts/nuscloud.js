
var server_host = "http://nuscloud.com";
var redirect_url = window.location.origin + "/ivlelogin.html"; //The popup window will redirect here on login
//This can be a blank page on your app as the implementation in the SDK
//will save the token and close the popup on successful auth
var app_id = "VGq4cvUdb6o9"; //As per registration
var permissions = "info-read friends-read";

var sdk = new NUSCloud(server_host, redirect_url, app_id, permissions);
