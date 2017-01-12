// Define the `vendingApp` module
var vendingApp = angular.module("vendingApp", []);

// Add a few global vars
// ---------------------------------------
var marqueeTimeout = null; // holds timer for marquee messages
var marqueeChangeAvailableFlag = 0; // keeps track of when the "take your change" message displayed
var marqueeMessageDelayInSeconds = 3; // The default delay between messages

// Define the `CoinsListController` controller on the `vendingApp` module
vendingApp.controller("VendingAppController", function VendingAppController($scope) {
	
	$scope.VendingName = vendingProps.name;
  $scope.coins = customerCoins;
  $scope.CustomerPurseValue = get_CustomerPurseValue();
  $scope.VendingMessage = "Insert Coins $0.00";
	$scope.products = vendingProps.products;
	$scope.CoinBalance = vendingProps.coinBalanceValue;
	$scope.CoinTrayTotal = vendingProps.coinTrayValue;

	$scope.purchase = function(productName) {
		var bal = vendingProps.coinBalanceValue;
		var productIndex = productLookup(productName);

		if (productIndex > -1) {
			if (vendingProps.products[productIndex].value > bal) {
				// Not enough money, honey.
				update_VendingMarquee("Please insert more coins to purchase.", marqueeMessageDelayInSeconds);

			} else if (vendingProps.products[productIndex].quantity > 0) {
				// Let's purchase this thing...
				vendingProps.coinBalanceValue -= vendingProps.products[productIndex].value;	// remove cost of product
				vendingProps.coinTrayValue += vendingProps.coinBalanceValue;								// add change to coin tray
				vendingProps.coinBalanceValue = 0;																					// empty balance
				vendingProps.products[productIndex].quantity -= 1;													// remove from inventory
				// Update front-end
				$scope.CoinBalance = vendingProps.coinBalanceValue;
				$scope.CoinTrayTotal = vendingProps.coinTrayValue;
				// Send a friendly message
				update_VendingMarquee("Thank you for your purchase.", marqueeMessageDelayInSeconds, "#72CE7B");
				// Place product graphic in the dispenser for a few seconds
				document.getElementById("VendingMachine-Dispenser-Item").setAttribute("src", 
					"img/product_" +vendingProps.products[productIndex].name+".png");
				setTimeout(function() {
					document.getElementById("VendingMachine-Dispenser-Item").setAttribute("src", "img/blank.gif");
				}, 3000);

			} else {
				// Display out of stock message only if trying to buy it anyway
				update_VendingMarquee("OUT OF STOCK!", marqueeMessageDelayInSeconds, "#ED1C24");
			}

			if (vendingProps.products[productIndex].quantity < 1) {
				// Out of paper, out of stock...
				vendingProps.coinTrayValue += vendingProps.coinBalanceValue; // return balace
				document.getElementById(vendingProps.products[productIndex].name).style.backgroundColor = "#ED1C24";
			}
			
			// update the coin amounts...
			$scope.CoinBalance = vendingProps.coinBalanceValue;
			$scope.CoinTrayTotal = vendingProps.coinTrayValue;

			update_TrayImage();
		}
	};

	$scope.do_Refund = function() {
		var change = vendingProps.coinBalanceValue;

		if (change > 0) {
			// Let's make a refund to the customer
			vendingProps.coinTrayValue += change;
			vendingProps.coinBalanceValue = 0;
			update_VendingMarquee("Refund complete.", marqueeMessageDelayInSeconds, "#72CE7B");
		} else {
			update_VendingMarquee("There is no balance to refund.", marqueeMessageDelayInSeconds, "#72CE7B");
		}

		// update the coin amounts...
		$scope.CoinBalance = vendingProps.coinBalanceValue;
		$scope.CoinTrayTotal = vendingProps.coinTrayValue;

		update_TrayImage();
	};

	$scope.do_TakeChange = function() {
		var trayChangeTotal = vendingProps.coinTrayValue * 100;
		// Return currency in highest coin values first
		var NumQuarters = Math.floor(trayChangeTotal / 25);
		var NumDimes    = Math.floor((trayChangeTotal - NumQuarters * 25) / 10);
		var NumNickels  = Math.floor((trayChangeTotal - NumQuarters * 25 - NumDimes * 10) / 5);
		var NumPennies  = trayChangeTotal - NumQuarters * 25 - NumDimes * 10 - NumNickels * 5;

		customerCoins[0].quantity += NumPennies;
		customerCoins[1].quantity += NumNickels;
		customerCoins[2].quantity += NumDimes;
		customerCoins[3].quantity += NumQuarters;
		
		vendingProps.coinTrayValue = 0;

		// update the coin amounts...
		$scope.CoinBalance = vendingProps.coinBalanceValue;
		$scope.CoinTrayTotal = vendingProps.coinTrayValue;
		$scope.CustomerPurseValue = get_CustomerPurseValue();

		update_TrayImage();
	};
});

/* --------------------------------------------- */
/* Various App Functions                         */
/* --------------------------------------------- */

function update_TrayImage() {

	if (vendingProps.coinTrayValue > 0) {
		document.getElementById("VendingMachine-ChangeTray-ChangeImg").setAttribute("src", "img/img_change.png");
	} else {
		document.getElementById("VendingMachine-ChangeTray-ChangeImg").setAttribute("src", "img/blank.gif");
	}
}

function update_VendingMarquee(message, timeoutTilDefaultInSeconds, msgColor) {
	var marq = document.getElementById("VendingMachine-Marquee").firstChild;

	if (marqueeTimeout !== null) { clearMarqueeTimer(); }

	if (typeof(message) !== "string" || message == "") {
		// Create the default message for the marquee...
		message = (vendingProps.coinBalanceValue > 0 ? "Current Balance" : "Insert Coins")+
			" $"+vendingProps.coinBalanceValue.formatCurrency(2);
		timeoutTilDefaultInSeconds = -1;
	}
	if (typeof(timeoutTilDefaultInSeconds) !== "number") { timeoutTilDefaultInSeconds = -1; }
	if (typeof(msgColor) !== "string") { msgColor = "#FF9B00"; }

	marq.style.color = msgColor;
	marq.innerHTML = message;

	if (vendingProps.coinTrayValue > 0) {

		marqueeTimeout = setTimeout(function() {
			update_VendingMarquee(
				(marqueeChangeAvailableFlag === 0 ? "Please take your change." : ""), 3);

			marqueeChangeAvailableFlag = 1-marqueeChangeAvailableFlag;
		}, marqueeMessageDelayInSeconds*1000);

	} else if (timeoutTilDefaultInSeconds >= 0) {
		marqueeTimeout = setTimeout(update_VendingMarquee, timeoutTilDefaultInSeconds*1000);
	}
}
function clearMarqueeTimer() {
	clearTimeout(marqueeTimeout);
	marqueeTimeout = null;
}

function get_CustomerPurseValue() {
	var total = 0;

	customerCoins.forEach(function(el, index, arr) {
		total += get_CoinValue(el.name) * el.quantity;
	});

	return total;
}


function get_CoinValue(coinName) {
	var ret = 0;

	coinProps.forEach(function(el, index, arr) {
		if (el.name == coinName) {
			ret = el.value;
			return;
		}
	});

	return ret;
}

function dropSomeCoin(objCoin) {
	var coinSize = parseFloat(objCoin.getAttribute("size"));
  var coinWeight = parseFloat(objCoin.getAttribute("weight"));
  var customerCoin = null; // this will hold the customer's coin data
  // Get the app scope
  var appElement = document.querySelector("[ng-app=vendingApp]");
  var $scope = angular.element(appElement).scope();
  var controllerScope = $scope.$$childHead;

  // Check for coin size/weight combos
  coinProps.forEach(function(el, index, arr) {

  	if (el.weight === coinWeight && el.size === coinSize) {
  		// We found a match...
  		switch(el.name) {
  			case "Penny": // no pennies allowed
  				// First, check if customer has enough pennies to do this
  				customerCoin = update_CustomerPurse(el.name, -1);

  				if (customerCoin.quantity > -1) {
	  				update_VendingMarquee("Pennies not accepted here!", marqueeMessageDelayInSeconds, "#ED1C24");
	  				vendingProps.coinTrayValue += el.value;
	  			} else {
	  				update_VendingMarquee("Please take your change.", marqueeMessageDelayInSeconds);
	  				document.getElementById(el.name).style.backgroundColor = "#ED1C24";
	  			}
  				break;

  			default: // all other coins excepted

  				// First, check if customer has enough coins left
  				customerCoin = update_CustomerPurse(el.name, -1);
  				
  				if (customerCoin.quantity > -1) {
	  				vendingProps.coinBalanceValue += el.value;
	  				update_VendingMarquee(
	  					"New Balance $" +
	  					vendingProps.coinBalanceValue.formatCurrency(2), 
	  					marqueeMessageDelayInSeconds, "#72CE7B");
	  			} else {
	  				update_VendingMarquee();
	  			}

	  			if (customerCoin.quantity <= 0) {
  					document.getElementById(el.name).style.backgroundColor = "#ED1C24";
  				}
  				break;
  		}
  	}
  });
  
  // Update the front-end...
	controllerScope.$apply(function() {
		controllerScope.coins = customerCoins;
		controllerScope.CoinTrayTotal = vendingProps.coinTrayValue;
		controllerScope.CoinBalance = vendingProps.coinBalanceValue;
		controllerScope.CustomerPurseValue = get_CustomerPurseValue();
	});

	update_TrayImage();
}

function update_CustomerPurse(coinName, inc) {
	var ret = null;

	customerCoins.forEach(function(el, index, arr) {
		if (el.name == coinName) {
			el.quantity += inc;

			if (el.quantity < 0) {
				el.quantity = -1;
			}
			ret = el;
			customerCoins[index] = el;
			return;
		}
	});

	return ret; // hmmm... didn't find that coin
}

function productLookup(productName) {
	var ret = -1;

	vendingProps.products.forEach(function(el, index, arr) {
		if (el.name == productName) {
			ret = index;
			return;
		}
	});

	return ret;
}

/* --------------------------------------------- */
/* Awesome Drag-n-Drop Functions                 */
/* --------------------------------------------- */

function doDrag(e) {
	e.dataTransfer.setData("text", e.target.id);
}

function doDrop(e) {
	var objCoin = document.getElementById(e.dataTransfer.getData("text"));
  
  dropSomeCoin(objCoin);
  
  e.target.style.borderColor = "transparent";
	e.preventDefault();
}

function allowDrop(e) {
	e.preventDefault();
}

function doDragEnter(e) {
	e.target.style.borderColor = "#72CE7B";
	e.preventDefault();
}
function doDragLeave(e) {
	e.target.style.borderColor = "transparent";
	e.preventDefault();
}

/* --------------------------------------------- */
/* Various Common Functions                      */
/* --------------------------------------------- */

function imgError(e) {
	e.preventDefault();
}

Number.prototype.formatCurrency = function(c, d, t) {
	var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

/* --------------------------------------------- */
