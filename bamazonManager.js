var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
})

var response_overall;

connection.connect(function (err) {
    if (err) throw err;
    showMenu();
})

function showMenu() {
    inquirer.prompt([
        {
            name: "choices",
            message: "Select an option",
            type: "list",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(function (res) {
        switch (res.choices) {
            case "View Products for Sale":
                connection.query("SELECT * FROM products", function (error, response) {
                    if (error) throw error;
                    response_overall = response;
                    for (var i = 0; i < response_overall.length; i++) {
                        console.log("Item Id: " + response_overall[i].item_id + " | Product Name: " + response_overall[i].product_name
                            + " | Price: $" + response_overall[i].price + " | Quantity on Hand: " + response_overall[i].stock_quantity)
                    }
                    connection.end()
                })
                break;
            case "View Low Inventory":
                connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (error, response) {
                    if (error) throw error;
                    response_overall = response;
                    for (var i = 0; i < response_overall.length; i++) {
                        console.log("Item Id: " + response_overall[i].item_id + " | Product Name: " + response_overall[i].product_name
                            + " | Price: $" + response_overall[i].price + " | Quantity on Hand: " + response_overall[i].stock_quantity)
                    }
                    connection.end()
                })
                break;
            case "Add to Inventory":
                inquirer.prompt([
                    {
                        name: "addItem",
                        message: "Select ID to add stock to",
                        type: "input",
                        validate: function (value) {
                            if (isNaN(value) === false && parseInt(value) > 0) {
                                return true;
                            }
                            return false;
                        }
                    },
                    {
                        name: "addAmount",
                        message: "How much stock would you like to add?",
                        type: "input",
                        validate: function (value) {
                            if (isNaN(value) === false && parseInt(value) > 0) {
                                return true;
                            }
                            return false;
                        }
                    },
                ]).then(function (res) {
                    connection.query("UPDATE products SET stock_quantity = stock_quantity + " + res.addAmount + " WHERE ?",
                        [
                            {
                                item_id: res.addItem
                            }
                        ],
                        function (error, response) {
                            if (error) throw error;
                            console.log("You have added " + res.addAmount + " stock to Item ID " + res.addItem);
                            connection.end()
                        })
                })
                break;
            case "Add New Product":
                inquirer.prompt([
                    {
                        name: "itemName",
                        message: "Enter name/title of new item",
                        type: "input"
                    },
                    {
                        name: "departmentName",
                        message: "Enter department of new item",
                        type: "input"
                    },
                    {
                        name: "price",
                        message: "Enter price of item",
                        type: "input",
                        validate: function (value) {
                            if (isNaN(value) === false && parseFloat(value) > 0) {
                                return true;
                            }
                            return false;
                        }
                    },
                    {
                        name: "amount",
                        message: "How much stock would you like to add?",
                        type: "input",
                        validate: function (value) {
                            if (isNaN(value) === false && parseInt(value) > 0) {
                                return true;
                            }
                            return false;
                        }
                    }
                ]).then(function (res) {
                    connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ?",
                        [
                            [[res.itemName,res.departmentName,res.price,res.amount]]
                        ],
                        function (error, response) {
                            if (error) throw error;
                            console.log("You have added the following product - \nProduct Name: " + res.itemName + " | Department Name: " + res.departmentName
                                + " | Price: $" + res.price + " | Quantity on Hand: " + res.amount)
                            connection.end()
                        })
                })
                break;
            default:
                console.log("Incorrect response");
                break;
        }
    })
}