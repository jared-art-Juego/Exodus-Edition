const { app, BrowserWindow } = require('electron');

function createWindow() {
  // Crear ventana con frame: true (botones visibles) y maximizada
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    frame: true,                    // Mostrar botones de cerrar, minimizar, maximizar
    show: false,                    // No mostrar hasta que esté lista
    webPreferences: {
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Maximizar ventana
  win.maximize();

  // Resolver ruta correcta hacia index.html
  const path = require('path');
  const indexPath = path.join(__dirname, '..', 'index.html');
  
  win.loadFile(indexPath);
  
  // Mostrar ventana cuando esté lista
  win.once('ready-to-show', () => {
    win.show();
  });
  
  // Abrir DevTools en desarrollo (comentar en producción)
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

// Cerrar la app cuando se cierren todas las ventanas (excepto macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Re-crear ventana en macOS cuando se hace clic en el ícono del dock
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});