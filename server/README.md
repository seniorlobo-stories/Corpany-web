# Corpany Form Server

Servidor simple en Node.js para recibir envíos del formulario y guardar los datos en un archivo Excel (`Corpany — Leads.xlsx`) dentro de una carpeta local (puede ser una carpeta sincronizada con Google Drive).

Instalación y uso:

```bash
cd server
npm install
# Opcional: exporta DRIVE_PATH para apuntar a una carpeta de Drive montada o sincronizada
# export DRIVE_PATH="/Users/tuusuario/Google Drive/Corpany"
npm start
```

El servidor escucha por defecto en `http://localhost:3000` y expone `POST /submit`.

Acepta:
- `application/json` con los campos: `nombre`, `empresa`, `necesitas`, `presupuesto`, `email`, opcional `archivo` (base64) y `archivoNombre`.
- `multipart/form-data` con un campo `archivo` para subir un fichero y campos normales para el resto.

El Excel se actualizará con una nueva fila por envío y los archivos adjuntos se guardarán en subcarpetas por envío.
