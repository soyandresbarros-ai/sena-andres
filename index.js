const { ejecutarMenu } = require("./src/cli");
const {
  crearProducto,
  listarProductos,
  buscarProductoPorId,
  buscarProductosPorNombre,
  contarProductos,
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
  buscarProductosPorNombre,
  contarProductos,
  actualizarProducto,
  eliminarProducto,
  crear: crearProducto,
  listar: listarProductos,
  obtener: buscarProductoPorId,
  buscarPorNombre: buscarProductosPorNombre,
  contar: contarProductos,
  actualizar: actualizarProducto,
  eliminar: eliminarProducto,
};
