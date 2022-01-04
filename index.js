 /*-----------------------------------------
 * rforcier2 API Weather Codepen JS 
 * 
 * version:   1.0 
 * date:      08/06/2021 
 * author:    https://codepen.io/rforcier2
 * email:     n/a 
 * website:   n/a
 * version history: n/a
 *-----------------------------------------
 * resources:
 *   → Open Weather Map - https://openweathermap.org/api
 *
 * fixes:
 *   Would be more beneficial to call function w/ parameter of 
 *   city name. Making function more reusable
 *-----------------------------------------
**/
const getWeather = document.getElementById("getWeatherButton"),
	userInput = document.getElementById("userInput"),
	error = document.getElementById("error"),
	result = document.getElementById("results"),
	closeButtons = document.getElementsByClassName("close");

/*-----------------------------------------
 *	Declaring Global Variables
 *    → Normally wouldn't use global vars, but 
 *      for just a practice example it's OK
 *		→ Allows us to compare const v. let
 *-----------------------------------------
**/

/*-----------------------------------------
 * closeButtons IIFE
 * description:   - pairs close btn with parent div to
 *                  allow "closing" div from view
 * functionality: - If there's a close button give it's parent container
 *    					    the class to fade-in and fade-out
 *								- On click give parent element display value none
 *								- Set timeout to see fade animation
 *                - Also set to be an IIFE (es6 syntax) to pair
 *                  immediately on page load
 *-----------------------------------------
**/
(closeButtons =>{
	closeButtons = document.getElementsByClassName("close");
	for (let each of closeButtons) {
		each.onclick = function(){
			this.parentElement.classList.remove("fade-in"); 
			this.parentElement.classList.add("fade-out");  
			const displayNone = () => {
				this.parentElement.style.display = "none";
			};
			return setTimeout(displayNone, 300);
		};
	}
})();

/* only show error div when appropriate */
const showErrors = el => {
	for (let each of el) {
		each.style.display = "block";
	}
};

/*-----------------------------------------
 * convertTemp()
 * Temp from openweathermap comes in Kelvin,
 * we need U.S. Units (◦F - can you tell where I'm from?)
 *-----------------------------------------
**/
const convertTemp = K => (1.8 * (K - 273) + 32).toFixed(2);

/*-----------------------------------------
 * convertTime()
 * description: - Converts from OpenWeatherMap time (UK in this case)
 * 								to the local time (only hours change)
 * function: 		- Regex parses the time as it comes from the source
 * 							- We retrieve our user's current (h)our and replace the
 * 								source hour (sH) with user's.
 *-----------------------------------------
**/
const convertTime = time => {
	let re = /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/g,
		h = `${new Date().getHours()}`, 
		sH = re.exec(time)[0].split(":")[0];
	/* for NON 24hr time, uncomment line below */	
	// h === 0 ? h = 12 : h > 12 ? h -= 12 : h = h; 
	let newTime = time.replace(sH, h);
	return newTime;
};

/*-----------------------------------------
 * String Prototype Function
 * To convert our city name to proper case
 * regardless of how it is input by user:
 *-----------------------------------------
 */
String.prototype.toProperCase = function() {
	return this.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};

/*-----------------------------------------
 * API call will do it for us,
 * but we should be *extra* sure and replace
 * whitespace in city names as %20
 *-----------------------------------------
 */
String.prototype.fixWhiteSpace = function() {
	return this.replace(/ /g, "%20");
};

/*-----------------------------------------
 *	Window / Button Functionality:
 *  Really unneccesary, but for the sake of quick exercise
 *  this will do in a pinch
 * -----------------------------------------
**/
window.onload = function() {
	//getWeatherData('London');
	// Ideal use of function in future
};


/*-----------------------------------------
 * getWeatherData() => main function for retrieving data.
 * →  This function fetches weather data via
 *    API call to OpenWeatherMap (https://openweathermap.org)
 * →  We call the API with our city name and public key.
 * →  The info we get back is parsed as JSON ( .json() )
 * →  Then set results div and place in chosen elements
 *-----------------------------------------
**/
const getWeatherData = () => {
	let city = userInput.value.trim();
	let publicKey = `3dbbfca50d3674cc4510970916791fb0`;
	let apiCall = `https://api.openweathermap.org/data/2.5/forecast?q=${city.fixWhiteSpace()}&APPID=${publicKey}`;

	fetch(apiCall)
		.then(response => response.json())
		.catch(e => {
			console.error(`Retreival error: ${e}`);
		})
		.then(data => {
		/* data[0] holds all the most recent info, if more info needed,
			 could simply cycle through all of the elements with a loop.
		*/
			const { temp, humidity } = data.list[0].main; //temp / humidity
			const { description } = data.list[0].weather[0]; // general desc.
			const { dt_txt } = data.list[0]; //time
			const { country } = data.city; // country code
			const resultDiv = document.getElementById("resultContainer"),
				errorDiv = document.getElementById("errorContainer");
			errorDiv.style.display = "none"; // if results, no error
			resultDiv.style.display = "block"; // if results, display
			window.scrollTo(0, 200); //scroll if window is too small to view results.
/* Formatting result div */
			result.innerHTML = `
<h2>Weather for ${city.toProperCase()}: (${country})</h2>
<span><span>Temp:</span> ${convertTemp(temp)} &deg;F</span> 
<br />
<span><span>Humidity:</span> ${humidity}&percnt;</span>
<br />
<span><span>Overall Expect:</span> ${description.toProperCase()}</span> 
<br />
<span><span>Last Checked:</span> ${dt_txt} (UK time)</span>
<br />
<span><span>Local time:</span> ${convertTime(dt_txt)}</span>
`;
		})
		.catch(e => {
			let resultDiv = document.getElementById("resultContainer"),
				  errorDiv = document.getElementById("errorContainer"),
				  errorMsg = document.getElementById("error");
			resultDiv.style.display = "none"; // if error, no results
			errorDiv.style.display = "block"; // display error
			errorDiv.classList.remove("fade-out");// fade animations
			errorDiv.classList.add("fade-in"); // fade animations
			errorMsg.innerHTML = `Cannot find: ${city}!`; // display error msg.
			console.error(`Data Error: ${e} \n city probably does not exist`);
		});
};
/*Just an onclick submit button*/
getWeather.onclick = function() {
	getWeatherData();
};

/* → Function to submit if user hits enter while 
 *   typing in the input box.
 * → Common practice to accept 'enter' or 'return'
 *   keys as submit on forms
**/
userInput.onkeydown = function(e) {
	if (e.key === 'Enter') getWeatherData();
};
