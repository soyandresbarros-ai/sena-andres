require("dotenv").config();
const { Pool } = require("pg");

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

module.exports = {
  pool,
  formatoColombiano,
  crear,
  listar,
  obtener,
  actualizar,
  eliminar,
};