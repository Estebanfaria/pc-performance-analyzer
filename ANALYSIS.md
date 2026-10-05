# Análisis integral — modelo v3

Las puntuaciones son **índices de adecuación estimados**, no resultados medidos ni una garantía comercial. Se redondean a 0,5 puntos para evitar precisión ficticia. Escala: 9–10 Excelente; 8–8,5 Muy bueno; 7–7,5 Bueno; 6–6,5 Correcto; 5–5,5 Limitado; menos de 5 No recomendado **para la carga descrita**, no para todos los usos de la PC.

## Datos frente a estimaciones

Datos del catálogo: modelo, arquitectura, núcleos, memoria gráfica y especificaciones publicadas. Los hilos no están en el dataset: se muestran como no informados salvo cifra explícita del presupuesto/campo manual, sin asumir 2 por núcleo. El scoring no asume que más hilos equivalgan a más rendimiento. Tampoco se deducen generación PCIe, velocidad real del SSD, compatibilidad/certificación profesional, encoder, codecs ni consumo real. Los perfiles de CPU son heurísticos; las referencias gráficas raster y su procedencia permanecen en CATALOG.md y la metodología existente. Los FPS por juego y **todas** las puntuaciones profesionales son estimaciones; una media raster no es un benchmark de Premiere, Blender o IA.

## Fórmula reproducible

Cada tarea define en analyzer.mjs objetivos de CPU, GPU, RAM y VRAM, pesos y una nota de alcance. CPU se normaliza sobre los perfiles existentes (Ryzen 5 5600 = 1). GPU se normaliza sobre la capacidad raster de RTX 3060 = 1, como proxy limitado, sin prometer escalado profesional equivalente. Cada componente obtiene min(10, 10 × capacidad / (capacidad + 0,22 × objetivo)): curva de rendimientos decrecientes que evita saturar todas las categorías en 10. Alcanzar el objetivo equivale aproximadamente a 8,2, y superarlo aumenta el margen. CPU paralelo multiplica por 1 + 0,25 × log2(max(1, núcleos/6)): aproximación conservadora, no rendimiento de todos los núcleos ni de hilos; P/E cores, frecuencias y motor real requieren benchmarks. Un módulo aplica 0,95 a CPU; una frecuencia informada menor de 2666 MT/s aplica 0,96. No premiamos DDR5 por su nombre ni suponemos canales, frecuencias o velocidades ausentes.

Disco: NVMe 10, SSD 8,5, HDD 3,5 como índice de respuesta/caché, **no GB/s**. Si el tipo no se conoce, las tareas que lo necesitan quedan sin puntuación. Suma ponderada de componentes, con techo de RAM de 4 + 5 × RAM/objetivo cuando falta memoria. Para cargas gráficas exigentes: techo de 4 + 6 × min(1, VRAM/objetivo); integrada tiene techo 4,5; VRAM dedicada desconocida tiene techo 7 y confianza baja. IA añade 20% de adecuación de VRAM a los otros pesos; techo 8,5 por incertidumbre del entorno. 6K/8K también tiene techo 8,5; no se garantiza fluidez nativa. CPU/GPU sin referencia no reciben sustitutos aleatorios. Oficina y desarrollo no requieren referencia de GPU.

Gaming usa FPS existentes, no puntuaciones profesionales: adecuación por resolución = min(10, FPS centrales / 12); índice relativo de objetivo 120 FPS. Se mantienen rangos, calidad y supuestos por juego. La media de sus usos es solo un resumen; el detalle por resolución es decisivo. Categorías profesionales promedian sus tareas declaradas; si falta algún dato requerido, quedan sin referencia. No comparamos valor/precio porque el precio no se analiza.

Confianza medium para estimaciones con referencias; low para familias comparables, memoria gráfica no conocida o datos insuficientes. No asignamos high a índices que no están validados contra benchmarks del proyecto real. No se inventan modelos locales de IA, porcentajes de bottleneck, tiempos de render ni certificaciones. Fortalezas y upgrades usan condiciones explícitas; ampliar RAM se recomienda según uso creativo, no como obligación para oficina.

## Fuentes consultadas 05/10/2026

- [Adobe Premiere: requisitos técnicos](https://helpx.adobe.com/premiere/desktop/get-started/technical-requirements/adobe-premiere-pro-technical-requirements.html): orientación de RAM para HD y 4K. Cumplir requisitos no equivale a obtener un score concreto.
- [Adobe After Effects: memoria y rendimiento](https://helpx.adobe.com/after-effects/desktop/memory-storage-performance/improve-performance/improve-performance.html): RAM, caché y recursos de CPU influyen en preview/render.
- [Puget Systems: recomendaciones After Effects](https://www.pugetsystems.com/solutions/video-editing-workstations/adobe-after-effects/hardware-recommendations/): memoria elevada para trabajo profesional y alta resolución.
- [Blender: render GPU](https://docs.blender.org/manual/en/4.4/render/cycles/gpu_rendering.html): backends y compatibilidad dependen de GPU, sistema, driver y versión.

Los pesos y objetivos son decisiones editoriales explícitas del modelo, no están publicados por estas fuentes. Falta calibración con suites profesionales y configuraciones reales. Las notas del motor restringen cargas (2D/BIM moderado, timelines sencillos, desarrollo web, etc.) para no extrapolar una valoración a cualquier proyecto.

## Arquitectura

engine.mjs mantiene gaming y el contrato existente, añade integral desde analyzeHardware. analyzer.mjs centraliza tareas, scoring, confianza, hechos, perfil, fortalezas, límites y upgrades. analyzer-ui.mjs presenta resumen y detalle. integral-report.mjs produce el PNG 1080×1920 con siete categorías según perfil. Se conservan las fichas individuales de juegos/productividad y la comparación/exportación existente. El modo Integral del comparador reutiliza las mismas categorías y criterios, hasta tres PCs actualmente; el motor de categorías acepta cada configuración independientemente.


