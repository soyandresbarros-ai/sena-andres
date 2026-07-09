const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");
const { pool } = require("./db");
const { formatoColombiano } = require("./formatos");
const {
  crearProducto,
  listarProductos,
  buscarProductoPorId,
  actualizarProducto,
  eliminarProducto,
} = require("./productos");

function mostrarProducto(producto) {
  if (!producto) {
    console.log("Producto no encontrado.");
    return;
  }

  console.log("----------------------------------------");
  console.log(`ID: ${producto.id}`);
  console.log(`Nombre: ${producto.name}`);
  console.log(`Descripcion: ${producto.description || "Sin descripcion"}`);
  console.log(`Imagen: ${producto.image || "Sin imagen"}`);
  console.log(`Precio: ${formatoColombiano.format(producto.price)}`);
  console.log("----------------------------------------");
}

async function pedirId(rl) {
  while (true) {
    const respuesta = await rl.question("ID del producto: ");
    const id = Number.parseInt(respuesta.trim(), 10);

    if (!Number.isNaN(id) && id > 0) {
      return id;
    }

    console.log("Ingresa un ID valido.");
  }
}

async function pedirPrecio(rl, mensaje, valorActual) {
  while (true) {
    const respuesta = await rl.question(mensaje);
    const texto = respuesta.trim();

    if (!texto && valorActual !== undefined) {
      return valorActual;
    }

    const precio = Number(texto);

    if (!Number.isNaN(precio) && precio >= 0) {
      return precio;
    }

    console.log("Ingresa un precio valido, por ejemplo: 25000");
  }
}

async function crearDesdeTerminal(rl) {
  const name = (await rl.question("Nombre: ")).trim();
  const description = (await rl.question("Descripcion: ")).trim();
  const image = (await rl.question("URL de imagen: ")).trim();
  const price = await pedirPrecio(rl, "Precio: ");

  if (!name) {
    console.log("El nombre es obligatorio.");
    return;
  }

  const producto = await crearProducto(name, description, image, price);
  console.log("Producto creado:");
  mostrarProducto(producto);
}

async function listarDesdeTerminal() {
  const productos = await listarProductos();

  if (productos.length === 0) {
    console.log("No hay productos registrados.");
    return;
  }

  productos.forEach(mostrarProducto);
}

async function buscarDesdeTerminal(rl) {
  const id = await pedirId(rl);
  const producto = await buscarProductoPorId(id);
  mostrarProducto(producto);
}

async function actualizarDesdeTerminal(rl) {
  const id = await pedirId(rl);
  const productoActual = await buscarProductoPorId(id);

  if (!productoActual) {
    console.log("Producto no encontrado.");
    return;
  }

  console.log("Deja el campo vacio para conservar el valor actual.");

  const name =
    (await rl.question(`Nombre (${productoActual.name}): `)).trim() ||
    productoActual.name;
  const description =
    (
      await rl.question(
        `Descripcion (${productoActual.description || "sin descripcion"}): `,
      )
    ).trim() || productoActual.description;
  const image =
    (await rl.question(`URL de imagen (${productoActual.image || "sin imagen"}): `)).trim() ||
    productoActual.image;
  const price = await pedirPrecio(
    rl,
    `Precio (${formatoColombiano.format(productoActual.price)}): `,
    productoActual.price,
  );

  const producto = await actualizarProducto(
    id,
    name,
    description,
    image,
    price,
  );

  console.log("Producto actualizado:");
  mostrarProducto(producto);
}

async function eliminarDesdeTerminal(rl) {
  const id = await pedirId(rl);
  const productoActual = await buscarProductoPorId(id);

  if (!productoActual) {
    console.log("Producto no encontrado.");
    return;
  }

  mostrarProducto(productoActual);

  const confirmar = (await rl.question("Seguro que deseas eliminarlo? (s/n): "))
    .trim()
    .toLowerCase();

  if (confirmar !== "s") {
    console.log("Eliminacion cancelada.");
    return;
  }

  const producto = await eliminarProducto(id);
  console.log("Producto eliminado:");
  mostrarProducto(producto);
}

function mostrarMenu() {
  console.log("\nElige una opcion:");
  console.log("1. Crear producto");
  console.log("2. Listar productos");
  console.log("3. Buscar producto por ID");
  console.log("4. Actualizar producto");
  console.log("5. Eliminar producto");
  console.log("6. Salir");
}

async function ejecutarMenu() {
  const rl = readline.createInterface({ input, output });
  let continuar = true;

  console.log("Sistema de productos");

  try {
    while (continuar) {
      mostrarMenu();
      const opcion = (await rl.question("Opcion: ")).trim();

      try {
        if (opcion === "1") {
          await crearDesdeTerminal(rl);
        } else if (opcion === "2") {
          await listarDesdeTerminal();
        } else if (opcion === "3") {
          await buscarDesdeTerminal(rl);
        } else if (opcion === "4") {
          await actualizarDesdeTerminal(rl);
        } else if (opcion === "5") {
          await eliminarDesdeTerminal(rl);
        } else if (opcion === "6") {
          continuar = false;
        } else {
          console.log("Opcion no valida.");
        }
      } catch (error) {
        console.error("Ocurrio un error:", error.message);
      }
    }
  } finally {
    rl.close();
    await pool.end();
  }
}

module.exports = { ejecutarMenu };
