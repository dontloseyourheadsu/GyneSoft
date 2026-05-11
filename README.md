# GyneSoft Desktop

Sistema clínico para notas médicas ginecológicas y visor de colposcopia, migrado a Tauri + React con interfaz en español.

## Funcionalidades clave

- Notas médicas completas con almacenamiento SQLite.
- Visor de colposcopia con prioridad de capturadora externa y fallback automático a webcam.
- Captura de imágenes en disco dentro del directorio de datos de la aplicación.
- Flujo compatible con Linux y macOS.

## Requisitos

- Node.js 20+
- Rust (toolchain estable)
- npm

### Linux (Fedora/derivados)

Instala dependencias de Tauri WebKit y utilidades de cámara:

```bash
sudo dnf install -y \
	webkit2gtk4.1-devel \
	gtk3-devel \
	libsoup3-devel \
	openssl-devel \
	v4l-utils
```

### macOS

- Instala Xcode Command Line Tools:

```bash
xcode-select --install
```

- Instala dependencias del proyecto (Node + Rust toolchain).

## Instalación

```bash
npm install
```

## Ejecutar la app

### Opción recomendada para Linux/macOS

Esta ruta evita problemas de watchers del sistema:

```bash
npm run desktop
```

Nota: `npm run desktop` construye la UI y la sirve localmente en `http://127.0.0.1:1420` antes de abrir Tauri.

### Si aparece "Could not connect to localhost: Connection refused"

Eso ocurre cuando Tauri corre en modo debug y espera el servidor de desarrollo en `http://localhost:1420`.

- Solución rápida: usa `npm run desktop`.
- Si quieres modo desarrollo con hot reload: ejecuta en terminales separadas:

```bash
npm run dev
npm run tauri dev
```

### Opción de desarrollo con Tauri CLI

```bash
npm run tauri dev
```

Si Linux reporta error de file watch limit, aumenta los límites de inotify:

```bash
sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl fs.inotify.max_user_instances=1024
```

Persistente:

```bash
echo "fs.inotify.max_user_watches=524288" | sudo tee /etc/sysctl.d/99-gynesoft.conf
echo "fs.inotify.max_user_instances=1024" | sudo tee -a /etc/sysctl.d/99-gynesoft.conf
sudo sysctl --system
```

## Build de producción

```bash
npm run build
cd src-tauri
cargo build --release
```
