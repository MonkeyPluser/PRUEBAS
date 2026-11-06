# FranV6X — sitio personal

Sitio estático para GitHub Pages. Archivos:

- `index.html`: estructura y SEO.
- `styles.css`: diseño responsive.
- `data.js`: contenido editable (mapas, métricas, redes, contacto, casos).
- `app.js`: interacciones, carga progresiva de cajas, simulador y escena 3D.

## Actualizar mapas

Editá `FRAN_DATA.maps` en `data.js`. Cada registro debe incluir `name`, `author`, `category`, `difficulty`, `description` y `steamId`. `image` puede quedar en `null` y se mostrará un placeholder sin enlaces rotos. Los mapas actuales son una selección recomendada por FranV6X y se acredita a sus autores originales.

## Contacto pendiente

Completá `contact.email`, `contact.mediaKit` y el array `clips` cuando estén listos. Actualizá las métricas y la fecha juntas.

## Preview social

TODO: crear y subir una imagen PNG 1200 × 630 y agregar las metaetiquetas `og:image` y `twitter:image` a `index.html`.

## Nota legal

Proyecto independiente, sin apuestas, dinero real ni premios. Counter-Strike y sus objetos pertenecen a Valve y otros titulares.

## Cotizaciones automáticas

El sitio **no consulta Skinport directamente desde el navegador**. GitHub Actions ejecuta `scripts/update_prices.py` cada seis horas y guarda las cotizaciones públicas verificadas en `prices.json` (el JSON es público, las claves privadas nunca se incluyen). Para la primera publicación: en GitHub → **Actions** → **Update public CS2 skin prices** → **Run workflow** (rama `main`). Luego verificar que `prices.json` aparezca en el repositorio. Si la API falla o responde con un catálogo incompleto, la acción no sobrescribe la captura anterior. Los otros mercados pueden restringir solicitudes desde el navegador y mostrarán «Consultar» si no es posible verificar una oferta.
