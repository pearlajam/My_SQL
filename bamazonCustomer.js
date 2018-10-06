var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
})


var id = 0;
var amount_to_buy = 0;
var response_overall;

connection.connect(function (err) {
    if (err) throw err;
    beginShopping();
})

function beginShopping() {
    connection.query("SELECT * FROM products", function (error, response) {
        if (error) throw error;
        response_overall = response;
        for (var i = 0; i < response_overall.length; i++) {
            console.log("Item Id: " + response_overall[i].item_id + " | Product Name: " + response_overall[i].product_name
                + " | Department: " + response_overall[i].department_name
                + " | Price: $" + response_overall[i].price)
        }
        askQuestion();
    })
}

function askQuestion() {
    inquirer.prompt([
        {
            name: "buyId",
            message: "Please select item to purchase?",
            type: "input",
            validate: function (value) {
                if (isNaN(value) === false && parseInt(value) > 0) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "buyAmount",
            message: "How many would you like to buy?",
            type: "input",
            validate: function (value) {
                if (isNaN(value) === false && parseInt(value) > 0) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (response) {
        id = response.buyId;
        amount_to_buy = response.buyAmount;
        if (response_overall[id - 1].stock_quantity >= amount_to_buy) {
            connection.query("UPDATE products SET stock_quantity =? WHERE item_id =?", [
                response_overall[id - 1].stock_quantity - amount_to_buy, id
            ], function (error, response) {
                if (error) throw error;
                console.log("Your purchase cost is: $" + ((response_overall[id - 1].price) * amount_to_buy).toFixed(2))
            })
        } else {
            console.log("Insufficient quantity!");
        }
        connection.end();
    })
}