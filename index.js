require("dotenv").config({ quiet: true });
const { Pool } = require("pg");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const formatoColombiano = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
});

async function crear(name, description, image, price) {
  const resultado = await pool.query(
    'INSERT INTO public."Productos" (name, description, image, price) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, description, image, price],
  );
  return resultado.rows[0];
}

async function listar() {
  const productos = await pool.query(
    'SELECT * FROM public."Productos" ORDER BY id',
  );
  return productos.rows;
}

async function obtener(id) {
  const producto = await pool.query(
    'SELECT * FROM public."Productos" WHERE id = $1',
    [id],
  );
  return producto.rows[0];
}

async function actualizar(id, name, description, image, price) {
  const riques = await pool.query(
    'UPDATE public."Productos" SET name = $2, description = $3, image = $4, price = $5 WHERE id = $1 RETURNING *',
    [id, name, description, image, price],
  );
  return riques.rows[0];
}

async function eliminar(id) {
  const resultado = await pool.query(
    'DELETE FROM public."Productos" WHERE id = $1 RETURNING *',
    [id],
  );
  return resultado.rows[0];
}

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

async function menuTerminal() {
  const rl = readline.createInterface({ input, output });

  console.log("Sistema de productos");

  try {
    let continuar = true;

    while (continuar) {
      console.log("\nElige una opcion:");
      console.log("1. Crear producto");
      console.log("2. Listar productos");
      console.log("3. Buscar producto por ID");
      console.log("4. Actualizar producto");
      console.log("5. Eliminar producto");
      console.log("6. Salir");

      const opcion = (await rl.question("Opcion: ")).trim();

      try {
        if (opcion === "1") {
          const name = (await rl.question("Nombre: ")).trim();
          const description = (await rl.question("Descripcion: ")).trim();
          const image = (await rl.question("URL de imagen: ")).trim();
          const price = await pedirPrecio(rl, "Precio: ");

          if (!name) {
            console.log("El nombre es obligatorio.");
            continue;
          }

          const producto = await crear(name, description, image, price);
          console.log("Producto creado:");
          mostrarProducto(producto);
        } else if (opcion === "2") {
          const productos = await listar();

          if (productos.length === 0) {
            console.log("No hay productos registrados.");
            continue;
          }

          productos.forEach(mostrarProducto);
        } else if (opcion === "3") {
          const id = await pedirId(rl);
          const producto = await obtener(id);
          mostrarProducto(producto);
        } else if (opcion === "4") {
          const id = await pedirId(rl);
          const productoActual = await obtener(id);

          if (!productoActual) {
            console.log("Producto no encontrado.");
            continue;
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

          const producto = await actualizar(id, name, description, image, price);
          console.log("Producto actualizado:");
          mostrarProducto(producto);
        } else if (opcion === "5") {
          const id = await pedirId(rl);
          const productoActual = await obtener(id);

          if (!productoActual) {
            console.log("Producto no encontrado.");
            continue;
          }

          mostrarProducto(productoActual);
          const confirmar = (
            await rl.question("Seguro que deseas eliminarlo? (s/n): ")
          )
            .trim()
            .toLowerCase();

          if (confirmar !== "s") {
            console.log("Eliminacion cancelada.");
            continue;
          }

          const producto = await eliminar(id);
          console.log("Producto eliminado:");
          mostrarProducto(producto);
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

if (require.main === module) {
  menuTerminal().catch(async (error) => {
    console.error("Error al ejecutar el programa:", error.message);
    await pool.end();
    process.exit(1);
  });
}

module.exports = {
  pool,
  formatoColombiano,
  crear,
  listar,
  obtener,
  actualizar,
  eliminar,
};
