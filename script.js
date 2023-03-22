const curlCommand = "curl https://www.google.com";
console.log(curltojsonobject(curlCommand));
$(document).ready(function () {
	// Bind button click event
	$("#convertButton").click(function () {
		// alert("Button clicked");
		// Read the value of textarea with ID 'curlText'
		var curlCommand = $("#curlText").val();
		$("#jsonText").val(JSON.stringify(curltojsonobject(curlCommand)));
		console.log(curltojsonobject(curlCommand));
	});
});
