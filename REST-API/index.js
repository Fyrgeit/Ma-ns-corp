import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors"
import mongoose, { Mongoose } from "mongoose";
import { Employee, Warehouse, ProductInfo, Order } from "./models.js";

const url = `mongodb+srv://mans:${Bun.env.CODE}@mans-corp.idc4qhl.mongodb.net/yippie?retryWrites=true&w=majority`;

await mongoose.connect(url);
console.log("Connected to " + mongoose.connection.name);

//const db = await Bun.file("db.json").json();

new Elysia()
    .use(cors())
    .get("/", () => "Wlecommie!")
    .group("/orders", route => route
        .get("/", async ({ query }) => {
            return filters(await Order.find().exec(), query);
        })
        .get("/cost_sum", async ({ query }) => {
            let products = await ProductInfo.find().exec();

            return filters(await Order.find().exec(), query)
                .map(order => priceOfOrder(order.products, products))
                .reduce((sum, val) => sum + val, 0);
        })
        .get("/cost_min", async ({ query }) => {
            let products = await ProductInfo.find().exec();

            return filters(await Order.find().exec(), query)
                .sort((a, b) => priceOfOrder(a.products, products) - priceOfOrder(b.products, products))[0];
        })
        .get("/cost_max", async ({ query }) => {
            let products = await ProductInfo.find().exec();

            return filters(await Order.find().exec(), query)
                .sort((a, b) => priceOfOrder(b.products, products) - priceOfOrder(a.products, products))[0];
        })
        .get("/newest", ({ query }) => {
            return filters(db.orders, query)
                .sort((a, b) => {
                    return Date.parse(b.status.deliveredTime || b.status.plockedTime || b.status.placedTime) -
                        Date.parse(a.status.deliveredTime || a.status.plockedTime || a.status.placedTime)
                })[0]
        })
        .get("/oldest", async ({ query }) => {
            return filters(await Order.find().exec(), query)
                .sort((a, b) => {
                    return Date.parse(a.status.deliveredTime || a.status.plockedTime || a.status.placedTime) -
                        Date.parse(b.status.deliveredTime || b.status.plockedTime || b.status.placedTime)
                })[0]
        })
    )
    .group("/products", route => route
        .get("/", async () => {
            return await ProductInfo.find().exec();
        })
        .get("/:id", async ({ params }) => {
            let products = await ProductInfo.findOne({ "id": params.id }).exec();

            if (!products) {
                return "Produkten finns inte";
            }

            let out = JSON.stringify(products);

            (await Warehouse.find().exec()).forEach(wh => {
                let yes = wh.stock.filter(s => s.productId == products.id);
                out += `\n${wh.location}: ${yes.length > 0 ? yes[0].count : "Finns ej i lager"}`;
            });

            return out;
        })
    )
    .group("/employees", route => route
        .get("/", async () => Employee.find().exec())
        .get("/:role", async ({ params }) => {
            let arr = await Employee.find({ "role": params.role }).exec();

            if (arr.length == 0) {
                return `No employees with role '${params.role}'`;
            }

            return arr;
        })
        .get("/:role/today", async ({ params }) => {
            let arr = await Employee.find({ "role": params.role }).exec();

            if (arr.length == 0) {
                return `No employees with role '${params.role}'`;
            }

            arr = arr.filter(e => e.schedule[new Date(Date.now()).getDay()]);

            if (arr.length == 0) {
                return "No employees working today";
            }

            return arr;
        })
        .get("/:role/:day", async ({ params }) => {
            let arr = await Employee.find({ "role": params.role }).exec();

            if (arr.length == 0) {
                return `No employees with role '${params.role}'`;
            }

            const days = [
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday"
            ];

            if (!days.includes(params.day)) {
                return `'${params.day}' is not a valid day`
            }

            arr = arr.filter(e => e.schedule[days.indexOf(params.day)]);

            if (arr.length == 0) {
                return `No employees working on ${params.day}s`;
            }

            return arr;
        })
        .get("/:role/free", async ({ params }) => {
            let arr = await Employee.find({ "role": params.role }).exec();

            if (arr.length == 0) {
                return `No employees with role '${params.role}'`;
            }

            let occupied = [];

            switch (params.role) {
                case "plocker":
                    (await Order.find({ "status.current": "placed" }).exec()).forEach(o => {
                        if (o.assignedPlocker) {
                            occupied.push(o.assignedPlocker);
                        }
                    });
                    return arr.filter(e => !occupied.includes(e.id) && e.role == "plocker");
                    break;
                case "driver":
                    (await Order.find({ "status.current": "plocked" }).exec()).forEach(o => {
                        if (o.assignedDriver) {
                            occupied.push(o.assignedDriver);
                        }
                    });
                    return arr.filter(e => !occupied.includes(e.id) && e.role == "driver");
                    break;
                default:
                    break;
            }
        })
    )
    .listen(8080, () => { console.log("Server live at http://localhost:8080") });

function filters(orders, query) {
    if (query.type) {
        if (!["placed", "plocked", "delivered"].includes(query.type)) {
            return `Invalid type: '${query.type}'`;
        }

        orders = orders.filter(order => order.status.current === query.type);
    }

    if (query.month) {
        if (query.month < 0 || query.month >= 12) {
            return `Invalid month: '${query.month}'`;
        }

        orders = orders.filter(order => new Date(order.status.deliveredTime || order.status.plockedTime || order.status.placedTime).getMonth() === Number(query.month));
    }

    return orders;
}

function priceOfOrder(products, productInfos) {
    let sum = 0;

    products.forEach(async p => {
        sum += productInfos.find(pi => pi.id == p.productId).price * p.count;
    })

    return sum;
}