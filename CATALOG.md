# Catálogo integrado

Fuente: [PC Part Dataset, Doc Oliver](https://github.com/docyx/pc-part-dataset).
Licencia MIT, reproducida en `CATALOG-LICENSE.txt`. El autor declara los datos
recopilados de PCPartPicker y actualizados el 23 de julio de 2025.

Snapshot fijado: `c52a04ca9465c83997ed335f7767b09a2005dd26`, descargado el 5 de octubre de 2026.
Incluye 1.413 registros de CPU, 6.636 placas de video comerciales, 4.973
motherboards y 13.553 memorias. Son 26.575 registros; algunos comparten nombre
y difieren en capacidad, velocidad o revisión. No son 26.575 benchmarks.

Se conservan nombres y especificaciones útiles (arquitectura/núcleos/relojes,
chipset/VRAM, socket/ranuras/capacidad, DDR/velocidad/módulos). No se importan
precios, imágenes ni scripts de terceros. Todos los datos se sirven localmente.
Los hashes SHA-256 y la revisión se incluyen en `catalog-data.mjs`.

`catalog-import.mjs` permite regenerar el snapshot desde el repositorio público:
`node catalog-import.mjs`. `--local` reutiliza los JSON descargados en
`catalog-source/`. Para actualizarlo, revisar y fijar una nueva revisión en ese
script, volver a importar y ejecutar `node --test engine.test.mjs catalog.test.mjs`.
No hay sincronización automática ni dependencia de una API durante el análisis.

Reconocimiento y rendimiento son distintos: `catalog.mjs` reconoce identidades
y recupera especificaciones. `hardware.mjs` resuelve perfiles medidos de GPU,
perfiles heurísticos y comparables de CPU de la misma arquitectura. Las variantes
KF/K conservan su nombre original y declaran la equivalencia. Las referencias
heurísticas tienen rangos más amplios que las GPU con medias medidas.

RAM: solo se completa una especificación desde el catálogo si todos los productos
coincidentes están de acuerdo. No se adivina el tamaño de un kit o su frecuencia.
Motherboard: el catálogo aporta socket, formato, máximo de RAM y ranuras cuando
la identidad es inequívoca; el dato original sigue en la evidencia del PDF.
No se declara compatibilidad de BIOS ni se agregan FPS por una motherboard.

El catálogo incluye también hardware antiguo/profesional sin referencia apropiada
para gaming. No se asignan FPS arbitrarios a esos equipos ni a modelos futuros.
La interfaz indica qué componente carece de referencia y mantiene los datos.
Un catálogo amplio reduce las omisiones, pero no garantiza reconocer todo PDF.
