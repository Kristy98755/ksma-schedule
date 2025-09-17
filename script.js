document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("cur").onclick = function() {
		showWeek("curr");
	};

	document.getElementById("next").onclick = function() {
		showWeek("next");
	};

	function showWeek(week) {

		if (week === "curr") {
			document.getElementById("NextWeek").style.display = "none";
			document.getElementById("CurrWeek").style.display = "block";
		} else {
			document.getElementById("CurrWeek").style.display = "none";
			document.getElementById("NextWeek").style.display = "block";
		}
	}
})