const BASE_DE_DATOS = {
    metodos: {
        encontrar: (id) => {
            return BASE_DE_DATOS.elementos.find((elemento) => elemento.id === id);
        },
        borrar: (elementos) => {
            elementos.forEach((elemento) => {
                const producto = BASE_DE_DATOS.metodos.encontrar(elemento.id);
                producto.cantidad = producto.cantidad - elemento.cantidad;
            });

            console.log(BASE_DE_DATOS);
        },
    },
    elementos: [
        {
            id: 0,
            nombre: "Pantalón",
            precio: 800,
            cantidad: 5,
        },
        {
            id: 1,
            nombre: "Camiseta",
            precio: 1500,
            cantidad: 50,
        },
        {
            id: 2,
            nombre: "Pelota",
            precio: 2500,
            cantidad: 80,
        },
    ],
};

const CARRITO_DE_COMPRAS = {
    elementos: [],
    metodos: {
        agregar: (id, cantidad) => {
            const ELEMENTO_CARRITO = CARRITO_DE_COMPRAS.metodos.obtener(id);
            if (ELEMENTO_CARRITO) {
                if (CARRITO_DE_COMPRAS.metodos.inventario(id, cantidad + ELEMENTO_CARRITO.cantidad)) {
                    ELEMENTO_CARRITO.cantidad++;
                } else {
                    alert("No hay más inventario");
                }
            } else {
                CARRITO_DE_COMPRAS.elementos.push({ id, cantidad });
            }
        },
        borrar: (id, cantidad) => {
            const ELEMENTO_CARRITO = CARRITO_DE_COMPRAS.metodos.obtener(id);

            if (ELEMENTO_CARRITO.cantidad - 1 > 0) {
                ELEMENTO_CARRITO.cantidad--;
            } else {
                CARRITO_DE_COMPRAS.elementos = CARRITO_DE_COMPRAS.elementos.filter(
                    (elemento) => elemento.id !== id
                );
            }
        },
        contador: () => {
            return CARRITO_DE_COMPRAS.elementos.reduce((acumulador, elemento) => acumulador + elemento.cantidad, 0);
        },
        obtener: (id) => {
            const INDEX = CARRITO_DE_COMPRAS.elementos.findIndex((elemento) => elemento.id === id);
            return INDEX >= 0 ? CARRITO_DE_COMPRAS.elementos[INDEX] : null;
        },
        obtenerTotal: () => {
            let total = 0;
            CARRITO_DE_COMPRAS.elementos.forEach((elemento) => {
                const ENCONTRADO = BASE_DE_DATOS.metodos.encontrar(elemento.id);
                total += ENCONTRADO.precio * elemento.cantidad;
            });
            return total;
        },
        inventario: (id, cantidad) => {
            return BASE_DE_DATOS.elementos.find((elemento) => elemento.id === id).cantidad - cantidad >= 0;
        },
        comprar: () => {
            BASE_DE_DATOS.metodos.borrar(CARRITO_DE_COMPRAS.elementos);
        },
    },
};

renderStore();

function renderStore() {
    const HTML = BASE_DE_DATOS.elementos.map((elemento) => {
        return `
            <div class="elemento">
                <div class="nombre">${elemento.nombre}</div>
                <div class="precio">${numberToCurrency(elemento.precio)}</div>
                <div class="cantidad">${elemento.cantidad} unidades</div>
                <div class="acciones"><button class="agregar" data-id="${
                    elemento.id
                }">Agregar al carrito</button></div>
            </div>`;
    });

    document.querySelector("#contenedor__tienda").innerHTML = HTML.join("");

    document.querySelectorAll(".elemento .acciones .agregar").forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = parseInt(button.getAttribute("data-id"));
            const item = BASE_DE_DATOS.metodos.encontrar(id);

            if (item && item.cantidad - 1 > 0) {
                CARRITO_DE_COMPRAS.metodos.agregar(id, 1);
                console.log(BASE_DE_DATOS, CARRITO_DE_COMPRAS);
                renderShoppingCart();
            } else {
                alert("Ya no hay existencia de ese artículo");
            }
        });
    });
}

function renderShoppingCart() {
    const HTML = CARRITO_DE_COMPRAS.elementos.map((elemento) => {
        const ELEMENTO_BD = BASE_DE_DATOS.metodos.encontrar(elemento.id);
        return `
            <div class="elemento">
                <div class="nombre">${ELEMENTO_BD.nombre}</div>
                <div class="precio">${numberToCurrency(ELEMENTO_BD.precio)}</div>
                <div class="cantidad">${elemento.cantidad} unidades</div>
                <div class="subtotal">Subtotal: ${numberToCurrency(
                    elemento.cantidad * ELEMENTO_BD.precio
                )}</div>
                <div class="acciones">
                    <button class="agregarUno" data-id="${ELEMENTO_BD.id}">+</button>
                    <button class="borrarUno" data-id="${ELEMENTO_BD.id}">-</button>
                </div>
            </div>
        `;
    });
    const BOTON_CERRAR = `
    <div class="cart-header">
        <button id="bClose">Cerrar</button>
    </div>`;
    const BOTON_COMPRA =
        CARRITO_DE_COMPRAS.elementos.length > 0
            ? `<div class="cart-actions">
        <button id="bPurchase">Terminar compra</button>
    </div>`
            : "";
    const TOTAL = CARRITO_DE_COMPRAS.metodos.obtenerTotal();
    const TOTAL_DIV = `<div class="total">Total: ${numberToCurrency(TOTAL)}</div>`;
    document.querySelector("#contenedor__carrito").innerHTML =
        BOTON_CERRAR + HTML.join("") + TOTAL_DIV + BOTON_COMPRA;

    document.querySelector("#contenedor__carrito").classList.remove("hide");
    document.querySelector("#contenedor__carrito").classList.add("show");

    document.querySelectorAll(".agregarUno").forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = parseInt(button.getAttribute("data-id"));
            CARRITO_DE_COMPRAS.metodos.agregar(id, 1);
            renderShoppingCart();
        });
    });

    document.querySelectorAll(".borrarUno").forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = parseInt(button.getAttribute("data-id"));
            CARRITO_DE_COMPRAS.metodos.borrar(id, 1);
            renderShoppingCart();
        });
    });

    document.querySelector("#bClose").addEventListener("click", (e) => {
        document.querySelector("#contenedor__carrito").classList.remove("show");
        document.querySelector("#contenedor__carrito").classList.add("hide");
    });
    const bPurchase = document.querySelector("#bPurchase");
    if (bPurchase) {
        bPurchase.addEventListener("click", (e) => {
            CARRITO_DE_COMPRAS.metodos.comprar();
        });
    }
}

function numberToCurrency(n) {
    return new Intl.NumberFormat("en-US", {
        maximumSignificantDigits: 2,
        style: "currency",
        currency: "USD",
    }).format(n);
}