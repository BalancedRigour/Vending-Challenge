// Vending Machine & Customer Data Collections

// Setup some starting values & properties
// ---------------------------------------
// Coin properties
var coinProps = 
	[{
    name: "Penny",
    value: 0.01,
    weight: 0.3,
    size: 0.75
  }, {
    name: "Nickel",
    value: 0.05,
    weight: 0.5,
    size: 0.875
  }, {
    name: "Dime",
    value: 0.10,
    weight: 0.2,
    size: 0.6875
  }, {
    name: "Quarter",
    value: 0.25,
    weight: 1,
    size: 1
  }];

// Vending machine properties
var vendingProps =
	{
		name: "Super Salty - Super Sweet",
		coinBalanceValue: 0,
		coinTrayValue: 0,
		products: 
			[{
				name: "Chips",
				value: 0.50,
				quantity: 6
			}, {
				name: "Candy",
				value: 0.65,
				quantity: 3
			}, {
				name: "Cola",
				value: 1.00,
				quantity: 9
			}]
	};

// What cash the poor customer starts with
var customerCoins =
	[{
    name: "Penny",
    weight: 0.3,
	  size: 0.75,
	  quantity: 10
  }, {
    name: "Nickel",
  	weight: 0.5,
  	size: 0.875,
  	quantity: 10
  }, {
    name: "Dime",
    weight: 0.2,
	  size: 0.6875,
	  quantity: 10
  }, {
    name: "Quarter",
		weight: 1,
    size: 1,
    quantity: 10
  }];
