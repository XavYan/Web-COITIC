# Web COITIC

Sitio estático del Colegio Profesional de Ingenieros Técnicos en Informática de Canarias. HTML, CSS y JavaScript sin frameworks, compilación ni dependencias de instalación. El parser Markdown Marked 17.0.5 se distribuye localmente con su licencia. El contenido institucional y el logo proceden de coitic.es.

**Web:** https://xavyan.github.io/Web-COITIC/

## Publicar una noticia desde GitHub

1. Abre `content/noticias/` y pulsa **Add file → Create new file** (o sube un archivo `.md`).
2. Usa un nombre único, en minúsculas, sin espacios ni tildes: `2026-11-02-titulo-de-la-noticia.md`.
3. Copia la estructura de `docs/plantilla-noticia.md`, rellena `titulo`, `fecha` (AAAA-MM-DD), `categoria`, `resumen` y el contenido.
4. Guarda el cambio en **main** mediante **Commit changes**. GitHub Actions publica automáticamente la noticia y actualiza su listado; no tienes que editar el índice.
5. Comprueba la ejecución en **Actions → Publicar web del COITIC**. En unos minutos aparecerá en la web. Si un cambio contiene errores, no sustituirá el último despliegue correcto: revisa el paso de validación.

Las noticias se ordenan de más reciente a más antigua. Todas las categorías se muestran automáticamente como filtros. El buscador busca por título, resumen y categoría. Cada noticia tiene un enlace compartible `#/noticia/nombre-del-archivo`.

Para añadir una imagen, súbela a `assets/noticias/` y añade en la cabecera `imagen: assets/noticias/mi-imagen.jpg` e `imagen_alt: Descripción de la imagen`. Para imágenes dentro del texto, utiliza `![Descripción](assets/noticias/mi-imagen.jpg)`.

`borrador: true` excluye una noticia de la web y del paquete desplegado. **El repositorio es público:** no guardes información confidencial en los borradores. Las fechas futuras son editoriales, no programan una publicación: cualquier noticia que no sea borrador se publica al guardar. No se importaron noticias del sitio anterior; la noticia de bienvenida se redactó para esta web y puede editarse o eliminarse.

## Actualizar los colegiados

Edita únicamente `content/colegiados.md`. La tabla contiene los 169 registros que figuraban en la web original al migrar, con las nueve columnas públicas. Modifica, añade o elimina filas y guarda en **main**. GitHub Actions vuelve a desplegarla y el directorio se actualiza automáticamente.

Conserva la fila de encabezados y la siguiente fila de guiones. Utiliza una fila por persona. Mantén el número de colegiado único. Para escribir una barra vertical dentro de una celda utiliza `&#124;`, para evitar crear una columna adicional. Los campos vacíos se dejan vacíos. La búsqueda funciona sin tildes; las columnas se pueden ordenar y hay paginación.

Ejemplo de estructura (no añadir este registro ficticio):

```markdown
| Nombre | Primer Apellido | Segundo Apellido | Nº Colegiado | Titulación | Servicios | Provincia | Teléfono | Email |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NOMBRE | APELLIDO | APELLIDO | 9999 | GRADO | | | | |
```

## Información institucional y adjuntos

- `content/pages/`: textos completos de las siete páginas institucionales en fragmentos HTML editables.
- `content/pages.json`: títulos y fuentes originales.
- `assets/documentos/`: documentos y recursos descargados del sitio original.
- `MIGRACION.md`: inventario, fuentes y referencias a archivos históricos que ya no estaban disponibles al migrar.

Las referencias históricas y afirmaciones del contenido se han conservado sin reinterpretarlas. La página de organización actualmente enlazada por el menú de coitic.es es la fuente de Junta de Gobierno y Comisiones, frente a páginas antiguas o cachés del buscador. El organigrama de origen puede ser anterior al listado de cargos. El nuevo sitio enlaza al formulario de contacto y a los avisos legales del sitio original, sin formularios, cuentas, cookies de analítica ni servicios de seguimiento propios.

## Cómo funciona la actualización

Cada `push` a **main**, incluidos los cambios de Markdown, ejecuta `.github/workflows/pages.yml`. El script `scripts/prepare.py` valida los metadatos y la tabla, genera automáticamente el catálogo `content/noticias/index.json` y copia los archivos a `_site/`. Este es un paso de indexación y copia, **no de compilación**. Los Markdown se interpretan en el navegador; no hay npm, bundler ni servidor de aplicación. No requiere tokens personales ni secretos adicionales.

GitHub Pages debe usar **Settings → Pages → Source: GitHub Actions**, ya configurado durante el despliegue inicial. El directorio de publicación contiene únicamente el sitio público y excluye documentación interna y scripts. Los archivos originales no se modifican al desplegar, salvo el índice generado en el entorno de Actions; no hay commits automáticos de vuelta al repositorio.

## Vista local

Para incluir nuevas noticias antes de previsualizar:

```sh
python3 scripts/prepare.py
python3 -m http.server 8000
```

Abre http://localhost:8000. No abras `index.html` con `file://`, porque los navegadores no permiten leer Markdown mediante `fetch` desde ese protocolo.

Para preparar una copia de publicación independiente: `python3 scripts/prepare.py --output _site`. Después puede servirse `_site/` desde cualquier alojamiento estático. No depende de GitHub en tiempo de navegación.

## Diseño y accesibilidad

Diseño adaptable a móviles, navegación por teclado, foco visible, enlace para saltar al contenido, preguntas desplegables, búsqueda, estados de error y ordenación accesible del directorio. Los textos Markdown pasan por una lista restrictiva de elementos y URL antes de insertarse en la página. No se permiten scripts ni HTML activo.
