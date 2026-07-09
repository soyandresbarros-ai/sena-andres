const { ejecutarMenu } = require("./src/cli");
const {
  crearProducto,
  listarProductos,
  buscarProductoPorId,
  actualizarProducto,
  eliminarProducto,
} = require("./src/productos");
const { pool } = require("./src/db");
const { formatoColombiano } = require("./src/formatos");

if (require.main === module) {
  ejecutarMenu().catch(async (error) => {
    console.error("Error al ejecutar el programa:", error.message);
    await pool.end();
    process.exit(1);
  });
}

module.exports = {
  pool,
  formatoColombiano,
  crearProducto,
  listarProductos,
  buscarProductoPorId,
  actualizarProducto,
  eliminarProducto,
  crear: crearProducto,
  listar: listarProductos,
  obtener: buscarProductoPorId,
  actualizar: actualizarProducto,
  eliminar: eliminarProducto,
};
