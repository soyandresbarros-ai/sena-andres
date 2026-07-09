const { pool } = require("./db");

async function crearProducto(name, description, image, price) {
  const resultado = await pool.query(
    'INSERT INTO public."Productos" (name, description, image, price) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, description, image, price],
  );

  return resultado.rows[0];
}

async function listarProductos() {
  const resultado = await pool.query(
    'SELECT * FROM public."Productos" ORDER BY id',
  );

  return resultado.rows;
}

async function buscarProductoPorId(id) {
  const resultado = await pool.query(
    'SELECT * FROM public."Productos" WHERE id = $1',
    [id],
  );

  return resultado.rows[0];
}

async function actualizarProducto(id, name, description, image, price) {
  const resultado = await pool.query(
    'UPDATE public."Productos" SET name = $2, description = $3, image = $4, price = $5 WHERE id = $1 RETURNING *',
    [id, name, description, image, price],
  );

  return resultado.rows[0];
}

async function eliminarProducto(id) {
  const resultado = await pool.query(
    'DELETE FROM public."Productos" WHERE id = $1 RETURNING *',
    [id],
  );

  return resultado.rows[0];
}

module.exports = {
  crearProducto,
  listarProductos,
  buscarProductoPorId,
  actualizarProducto,
  eliminarProducto,
};
