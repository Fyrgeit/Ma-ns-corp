import mongoose, { Mongoose } from "mongoose";
import { Employee, Warehouse, ProductInfo, Order } from "./models.js";

const url = "mongodb+srv://mans:5mEbtC89mkbussB1@mans-corp.idc4qhl.mongodb.net/yippie?retryWrites=true&w=majority";

await mongoose.connect(url);
console.log("Connected to " + mongoose.connection.name);

const names = (await Bun.file("names.txt").text()).split("\n");

const dbObject = {
    employees: [],
    warehouses: [
        {
            location: "Jönköping",
            id: 0,
            stock: []
        },
        {
            location: "Ängelholm",
            id: 1,
            stock: []
        },
        {
            location: "Kristianstad",
            id: 2,
            stock: []
        },
        {
            location: "Eriksberg",
            id: 3,
            stock: []
        },
    ],
    products: [
        {
            name: "Discombobulator",
            id: 0,
            price: 50
        },
        {
            name: "Thingimajig",
            id: 1,
            price: 20
        },
        {
            name: "Separatron",
            id: 2,
            price: 110
        },
        {
            name: "Scromper",
            id: 3,
            price: 70
        },
        {
            name: "Borkoid",
            id: 4,
            price: 35
        },
        {
            name: "Klaphton",
            id: 5,
            price: 65
        },
        {
            name: "Pluttifyer",
            id: 6,
            price: 130
        },
    ],
    orders: [],
};


for (let i = 0; i < 20; i++) {
    let newEmployee = {
        id: i,
        name: names[Math.floor(Math.random() * names.length)],
        role: Math.random() < 0.5 ? "plocker" : "driver",
        warehouse: Math.floor(Math.random() * dbObject.warehouses.length),
        schedule: []
    };
    
    for (let n = 0; n < 7; n++) {
        newEmployee.schedule.push(Math.random() < 0.6)
    }
    
    dbObject.employees.push(newEmployee);
}

function Random2023() {
    const start = new Date(2023, 7, 1).getTime();
    const end = Date.now();
    
    return start + Math.random() * (end - start);
}

dbObject.warehouses.forEach(warehouse => {
    dbObject.products.forEach(product => {
        if (Math.random() < 0.8) {
            warehouse.stock.push({
                productId: product.id,
                count: Math.ceil(Math.random() * 100)
            });
        }
    });
});

function getEmployee(role, dayIndex) {
    let arr = dbObject.employees.filter(e => e.schedule[dayIndex] && e.role == role);
    
    return arr[Math.floor(Math.random() * arr.length)].id;
}

// GENERATE ORDERS
for (let i = 0; i < 200; i++) {
    let newOrder = {
        id: i,
        products: [],
        assignedPlocker: null,
        assignedDriver: null,
        status: {
            current: null,
            placedTime: null,
            plockedTime: null,
            deliveredTime: null,
        },
    };
    
    newOrder.status.placedTime = new Date(Random2023());
    newOrder.status.plockedTime = new Date(newOrder.status.placedTime.getTime() + (Math.random() * 8 + 2) * 24 * 60 * 60 * 1000);
    newOrder.status.deliveredTime = new Date(newOrder.status.plockedTime.getTime() + (Math.random() * 15 + 3) * 24 * 60 * 60 * 1000);
    
    if (newOrder.status.plockedTime.getTime() > Date.now()) {
        newOrder.status.plockedTime = null;
        newOrder.status.deliveredTime = null;
        newOrder.status.current = "placed";
        if (Math.random() < 0.5) {
            newOrder.assignedPlocker = getEmployee("plocker", newOrder.status.placedTime.getDay())
        }
    } else if (newOrder.status.deliveredTime.getTime() > Date.now()) {
        newOrder.status.deliveredTime = null;
        newOrder.status.current = "plocked";
        newOrder.assignedPlocker = getEmployee("plocker", newOrder.status.placedTime.getDay())
        if (Math.random() < 0.5) {
            newOrder.assignedDriver = getEmployee("driver", newOrder.status.plockedTime.getDay())
        }
    } else {
        newOrder.status.current = "delivered";
        newOrder.assignedPlocker = getEmployee("plocker", newOrder.status.placedTime.getDay())
        newOrder.assignedDriver = getEmployee("driver", newOrder.status.plockedTime.getDay())
    }
    
    newOrder.products.push({
        productId: dbObject.products[Math.floor(Math.random() * dbObject.products.length)].id,
        count: Math.ceil(Math.random() * 4)
    });
    
    dbObject.products.forEach((p) => {
        if (Math.random() < 0.3) {
            newOrder.products.push({
                productId: p.id,
                count: Math.ceil(Math.random() * 4)
            });
        }
    });
    
    dbObject.orders.push(newOrder);
}

await Bun.write("db.json", JSON.stringify(dbObject));
console.log("Generated database file :D")

await Employee.collection.drop();
dbObject.employees.forEach(employee => {
    Employee.create(employee);
});
console.log("Added employees");

await Order.collection.drop();
dbObject.orders.forEach(order => {
    Order.create(order);
});
console.log("Added orders");

await Warehouse.collection.drop();
dbObject.warehouses.forEach(warehouse => {
    Warehouse.create(warehouse);
});
console.log("Added warehouses");

await ProductInfo.collection.drop();
dbObject.products.forEach(product => {
    ProductInfo.create(product);
});
console.log("Added products");