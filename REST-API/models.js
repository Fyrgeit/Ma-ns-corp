import {Schema, model} from "mongoose";

export const Employee = model("Employee", new Schema({
    id: {
        type: Number,
        require: true,
        unique: true
    },
    name: {
        type: String,
        require: true
    },
    role: {
        type: String,
        require: true
    },
    schedule: [
        {type: Boolean, required: true},
        {type: Boolean, required: true},
        {type: Boolean, required: true},
        {type: Boolean, required: true},
        {type: Boolean, required: true},
        {type: Boolean, required: true},
        {type: Boolean, required: true}
    ]
}));

export const Warehouse = model("Warehouse", new Schema({
    location: {
        type: String,
        require: true
    },
    id: {
        type: Number,
        require: true,
        unique: true
    },
    stock: [{
        productId: {
            type: Number,
            require: true
        },
        count: {
            type: Number,
            require: true
        }
    }]
}));

export const ProductInfo = model("ProductInfo", new Schema({
    name: {
        type: String,
        require: true
    },
    id: {
        type: Number,
        require: true,
        unique: true
    },
    price: {
        type: Number,
        require: true
    }
}));

export const Order = model("Order", new Schema({
    id: {
        type: Number,
        require: true,
        unique: true
    },
    products: [{
        productId: {
            type: Number,
            require: true
        },
        count: {
            type: Number,
            require: true
        }
    }],
    assignedPlocker: {
        type: Number,
        require: true
    },
    assignedDriver: {
        type: Number,
        require: true
    },
    status: {
        current: {
            type: String,
            require: true
        },
        placedTime: {
            type: Date,
            require: true
        },
        plockedTime: {
            type: Date,
            require: true
        },
        deliveredTime: {
            type: Date,
            require: true
        }
    }
}));