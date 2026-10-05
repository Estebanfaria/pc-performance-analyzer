# PC Performance Analyzer — evolución v2

Mejora incremental del MVP actual, publicado en https://pc-performance-analyzer-one.vercel.app/. Conserva PDF, carga manual, ejemplo, Gaming/Productividad, selección de resolución, exportación PNG 1080×1920 y tres snapshots independientes para futura comparación.

## Flujo

Subir PDF → extraer texto o ejecutar OCR → «Detectamos esta PC» → corregir solo si hace falta → confirmar → analizar → descargar o compartir ficha. Los documentos se procesan en el dispositivo; no se transmiten a un servicio de análisis. La función de compartir solo transmite la imagen al destino elegido explícitamente por el visitante.

## Módulos

- `catalog-data.mjs` y `catalog.mjs`: snapshot local de 26.575 registros de CPU, GPU, motherboard y RAM de PC Part Dataset (MIT). Conserva especificaciones, distingue nombres ambiguos y completa solo datos inequívocos. Fuente/revisión/licencia y actualización en `CATALOG.md` y `catalog-import.mjs`.

- `document.mjs`: PDF.js, reconstrucción de filas por coordenadas y OCR Tesseract español/inglés para páginas escaneadas o con texto insuficiente. Todos los workers, WASM y datos de idioma se sirven desde el mismo sitio.
- `parser.mjs`: contexto de componentes, RAM y cantidades/kit, frecuencia, VRAM, varios discos, motherboard, fuente, refrigeración y gabinete. Conserva evidencia y alternativas.
- `hardware.mjs`: normalización, aliases, fuzzy matching conservador con mismos números, perfiles conocidos y familias comparables. No reemplaza la identidad del componente por su equivalente.
- `engine.mjs`: gaming por resolución/preset, cuello de CPU, RAM, VRAM, recomendación y diez tareas de productividad. Catálogo ausente no bloquea una PC identificada: usa equivalencia declarada cuando hay una familia válida. Familias sin referencia conservan el hardware y muestran FPS no disponibles.
- `games.mjs`: nueve perfiles e iconos vectoriales propios integrados; no son logos oficiales ni requieren descargas remotas.
- `report.mjs`: mismo Canvas para preview y PNG. Tipografía Arial, ajuste de nombres largos y colores blanco/celeste/negro. Gaming: tabla 1080p/1440p/4K. Productividad: niveles y condiciones de trabajo, sin FPS.

## Ejecutar

Node 22+. `pnpm install`, `pnpm test`, `pnpm build`, `pnpm dev`. Alternativa: npm install y npm run build. El comando de construcción de Vercel es `npm run build`, con output `dist` y preset Other. No se requieren secretos ni backend. El postinstall de tesseract.js solo muestra información de donaciones y está explícitamente ignorado por pnpm.

## Datos y precisión

Parte de las referencias de GPU se basa en medias raster Ultra de la [GPU Hierarchy de Tom's Hardware](https://www.tomshardware.com/reviews/gpu-hierarchy,4388.html), consultada el 05/10/2026. Las tres columnas por GPU pertenecen a la misma batería de pruebas. Se usan para calibrar capacidad relativa; NO se presentan como benchmarks directos de Fortnite/Warzone/etc. Los perfiles de CPU, multiplicadores por juego, ajustes de preset y otros modelos son heurísticos. Cada resultado por juego es una estimación redondeada con rango de incertidumbre; la equivalencia de familia amplía ese rango. Los intervalos son orientativos, no intervalos estadísticos con cobertura garantizada.

High es el preset inicial. No incluye ray tracing, reescalado ni frame generation. Fortnite supone DX12 sin Lumen/Nanite; Minecraft Java sin shaders/mods a 12 chunks; GTA V Legacy sin MSAA ni gráficos avanzados; Roblox depende del mapa y del límite de FPS. Los rangos GTA V están limitados a 185 FPS y Roblox a 240. GTA VI se omite: la [información oficial de Rockstar](https://support.rockstargames.com/articles/4QfG4FmZCf5W1gS8jy4UVT/grand-theft-auto-vi-platform-editions-and-versions-Platforms) no proporciona benchmarks de PC.

Productividad expresa comodidad para tareas moderadas, no tiempo de render ni garantía de compatibilidad. Los puntajes internos solo asignan niveles; codecs, aceleración, efectos, RAM y VRAM modifican resultados. Antes de usar estas fichas como compromiso comercial, calibrar los perfiles por juego con ensayos de configuraciones reales.

## Límites y validación

15 MB, 50 páginas de texto y máximo 8 páginas sometidas a OCR por documento. Si alcanza ese límite, muestra que la lectura es parcial. OCR imperfecto: nombres y cifras deben confirmarse. Si aparecen varias CPUs/GPUs, conserva candidatos y avisa de la selección inicial. Sin datos suficientes de CPU/GPU/RAM solicita solo esos datos, no los componentes opcionales. No se guarda el PDF; los snapshots viven en la pestaña.

`engine.test.mjs` y `catalog.test.mjs` cubren normalización, fuzzy, cantidades, no confundir VRAM con RAM, discos, alternativas, hardware comparable, presets, filas de PDF, variantes Core Ultra y memoria ambigua. `prueba-*.pdf` son fixtures sintéticos identificados explícitamente como pruebas, incluyendo escaneo. También se reprodujo la configuración detectada en el navegador del usuario (Core Ultra 7 265KF / RTX 5070 Ti / 32 GB DDR5); el archivo original de ese presupuesto no está guardado en este repositorio.

PDF.js y Tesseract: Apache-2.0; datos lingüísticos: paquetes oficiales de Tesseract.js. Las fuentes de interfaz tienen fallback local y la ficha exportada usa fuentes del sistema. No hay dependencias visuales remotas para iconos ni PNG.
