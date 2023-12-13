async function reload() {
    let response = await fetch("http://localhost:8080/orders");
    let json = await response.json();

    json.forEach(order => {
        
        let orderEl = document.createElement("div");
        document.body.append(orderEl);
        
        let idEl = document.createElement("h1");
        orderEl.append(idEl);
        idEl.innerText = "OrderId: " + order.id;
        
        let placedEl = document.createElement("p");
        orderEl.append(placedEl);
        placedEl.innerText = "Order placed: " + order.status.placedTime;
        
        let productsEl = document.createElement("p");
        orderEl.append(productsEl);
        productsEl.innerText = order.products.map(p => p.count).reduce((val, sum) => val + sum, 0) + " products";

    });
}