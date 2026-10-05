# PC Performance Analyzer

MVP web en español, estático y compatible con Vercel. PDF.js procesa presupuestos en el navegador: no se envían a un servidor ni se guardan. Detección de un catálogo inicial de CPU y GPU, RAM y almacenamiento, corrección manual, modos Gaming/Productividad, resoluciones 1080p/1440p/4K y exportación PNG 1080×1920.

## Desarrollo

Node 22 o posterior. `npm install`, `npm run build`, `npm run dev`. Abrir http://127.0.0.1:4173. `npm test` verifica detección y estimaciones. También se puede usar pnpm con el lockfile incluido.

## Vercel

Importar este repositorio. Framework: Other. Build: `npm run build`. Output: `dist`. La configuración está en vercel.json. No hay secretos, base de datos ni variables de entorno.

## Límites y metodología

El motor es una heurística propia v1, no una base de benchmarks ni una promesa de FPS. Los índices relativos y coeficientes son supuestos del MVP; requieren calibración con pruebas reales antes de usarse para asesoramiento comercial. Se muestran rangos y aclaraciones tanto en pantalla como en la placa. No hay OCR, soporte de PDF cifrado, ni identificación universal de hardware. Límites: 15 MB y 50 páginas. Los modelos desconocidos requieren selección manual; nunca se sustituyen silenciosamente.

Los puntajes creativos suponen proyectos moderados, edición 1080p y composiciones ligeras; no representan tiempos de render. Roblox y EA Sports FC varían por experiencia/edición. Almacenamiento afecta respuesta, no aumenta FPS artificialmente.

## Arquitectura para comparar

`engine.mjs` es independiente de la interfaz: catálogos, detect(text), estimate(spec,resolution) y makeBudget(spec,name). Los registros tienen id, schemaVersion, fecha y snapshot de componentes. La interfaz mantiene hasta tres registros independientes en memoria de la pestaña. Próxima etapa: interfaz de comparación, persistencia explícita, catálogo más amplio y motor calibrado. No hay comparación visual aún ni persistencia al recargar.

PDF.js es Apache-2.0. Fuentes Google Fonts con fallback local. La placa usa Arial y Canvas, sin servicios externos.
