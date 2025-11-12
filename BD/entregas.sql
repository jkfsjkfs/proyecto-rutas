
-- CREATE SCHEMA entregas;


USE bq0fe1atouxr0cdkw6yi;
-- ============================================================
-- 1. Creación de tablas
-- ============================================================
CREATE TABLE municipios (
    id_mpio INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    latitud DECIMAL(9,6),
    longitud DECIMAL(9,6),
    subregion VARCHAR(50)
);

CREATE TABLE distancias (
    id_origen INT NOT NULL,
    id_destino INT NOT NULL,
    distancia_km DECIMAL(8,2) NOT NULL,
    PRIMARY KEY (id_origen, id_destino),
    FOREIGN KEY (id_origen) REFERENCES municipios(id_mpio),
    FOREIGN KEY (id_destino) REFERENCES municipios(id_mpio)
);

-- ============================================================
-- 2. Municipios base
-- ============================================================
INSERT INTO municipios (id_mpio, nombre, latitud, longitud, subregion) VALUES
(1, 'Medellín', 6.2442, -75.5812, 'Área Metropolitana'),
(2, 'Bello', 6.3389, -75.5620, 'Área Metropolitana'),
(3, 'Copacabana', 6.3495, -75.5083, 'Área Metropolitana'),
(4, 'Girardota', 6.3761, -75.4496, 'Área Metropolitana'),
(5, 'Caldas', 6.0911, -75.6343, 'Área Metropolitana'),
(6, 'Itagüí', 6.1710, -75.6110, 'Área Metropolitana'),
(7, 'Donmatías', 6.4851, -75.3939, 'Norte Cercano'),
(8, 'Entrerríos', 6.5620, -75.5170, 'Norte Cercano'),
(9, 'San Pedro de los Milagros', 6.4599, -75.5558, 'Norte Cercano'),
(10, 'Santa Rosa de Osos', 6.6406, -75.4600, 'Norte Cercano'),
(11, 'Yolombó', 6.5972, -75.0120, 'Nordeste'),
(12, 'Cisneros', 6.5389, -75.0880, 'Nordeste'),
(13, 'San José del Nus', 6.5390, -74.9920, 'Nordeste'),
(14, 'Maceo', 6.5520, -74.7870, 'Nordeste'),
(15, 'Yalí', 6.6960, -74.8350, 'Nordeste'),
(16, 'Caracolí', 6.4090, -74.7600, 'Nordeste'),
(17, 'Remedios', 7.0280, -74.6920, 'Nordeste'),
(18, 'Segovia', 7.0803, -74.6983, 'Nordeste');

-- ============================================================
-- 3. Distancias aproximadas (km)
-- ============================================================
INSERT INTO distancias (id_origen, id_destino, distancia_km) VALUES
-- Área Metropolitana
(1,2,12.0),(1,3,19.0),(1,4,28.0),(1,5,22.0),(1,6,10.0),
(2,3,8.0),(2,4,12.0),(3,4,10.0),(5,6,12.0),

-- Norte Cercano desde Medellín
(1,7,52.0),(1,8,64.0),(1,9,47.0),(1,10,75.0),
(7,8,25.0),(7,9,18.0),(8,9,20.0),(8,10,28.0),(9,10,30.0),

-- Nordeste desde Medellín
(1,11,122.0),(1,12,108.0),(1,13,120.0),(1,14,145.0),(1,15,160.0),
(1,16,165.0),(1,17,185.0),(1,18,195.0),

-- Relaciones dentro del Nordeste
(11,12,28.0),(12,13,14.0),(13,14,32.0),(14,15,22.0),(15,16,25.0),
(16,17,35.0),(17,18,10.0),(12,17,70.0),(13,17,65.0),

-- Enlaces Norte–Nordeste
(10,11,85.0),(9,12,70.0),(7,12,75.0),

-- Área Metropolitana ↔ Norte
(4,7,25.0),(3,7,40.0),(2,9,42.0);

-- Simetría (copiar inversos si lo deseas)
-- INSERT INTO distancias (id_origen, id_destino, distancia_km)
-- SELECT id_destino, id_origen, distancia_km FROM distancias;



CREATE TABLE rutas (
  id_ruta INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  origen_id INT NOT NULL,
  destino_id INT NOT NULL,
  id_intermedios TEXT NULL,
  orden_optimo TEXT NOT NULL,
  distancia_total DECIMAL(10,2) DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (origen_id) REFERENCES municipios(id_mpio),
  FOREIGN KEY (destino_id) REFERENCES municipios(id_mpio)
);





