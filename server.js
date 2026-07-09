const express = require("express");
const { crear, listar, obtener, actualizar, eliminar } = require("./index");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Listar todos los productos
app.get("/productos", async (req, res) => {
  try {
    const productos = await listar();
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar los productos" });
  }
});

// Obtener un producto por ID
app.get("/productos/:id", async (req, res) => {
  try {
    const producto = await obtener(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

// Crear un producto
app.post("/productos", async (req, res) => {
  try {
    const { name, description, image, price } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ error: "name y price son obligatorios" });
    }
    const producto = await crear(name, description, image, price);
    res.status(201).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

// Actualizar un producto
app.put("/productos/:id", async (req, res) => {
  try {
    const { name, description, image, price } = req.body;
    const producto = await actualizar(
      req.params.id,
      name,
      description,
      image,
      price,
    );
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

// Eliminar un producto
app.delete("/productos/:id", async (req, res) => {
  try {
    const producto = await eliminar(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ mensaje: "Producto eliminado", producto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});