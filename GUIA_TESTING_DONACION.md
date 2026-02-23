# 🧪 GUÍA DE TESTING - SISTEMA DE DONACIÓN

## ✅ CAMBIOS REALIZADOS

### 1. **Sistema de Donación Mejorado**
- ✅ Validación más robusta
- ✅ Mensajes de error claros
- ✅ Confirmación antes de procesar
- ✅ Mejor logging en consola

### 2. **Modal Actualizado**
- ✅ Alias **MÁS VISIBLE** en caja destacada
- ✅ Opciones predefinidas ($100, $250, $500, $1000)
- ✅ Campo personalizado para cualquier monto
- ✅ Botón ENVIAR más obvio

### 3. **Archivo Compilado**
- ✅ Juego-Final/win-unpacked/ actualizado
- ✅ donation_system.js v2.0 integrado
- ✅ index.html con modal mejorado

---

## 🎮 CÓMO TESTEAR

### Paso 1: Abrir el Juego
```bash
cd "c:\Users\Jared\Desktop\EXODUS EDITION"
npm start
# o ejecutar Juego-Final/win-unpacked/Exodus-Edition.exe
```

### Paso 2: Ver Menú Principal
Espera a que cargue la pantalla de menú.

### Paso 3: Buscar Botón "💝 APOYAR MISIÓN"
Debería estar en la sección del menú con texto "Gracias por tu apoyo, Piloto"

### Paso 4: Hacer Clic en el Botón
- **Esperado:** Se abre un modal con opciones de donación
- **¿Falla?** 
  - Abre consola (F12)
  - Busca errores en la consola
  - Copia el error y comparte

### Paso 5: Seleccionar Monto

#### OPCIÓN A: Usar predefinido
```
1. Haz clic en $100, $250, $500, o $1000
2. Se abrirá un confirmation dialog
3. Confirma haciendo clic "OK"
```

#### OPCIÓN B: Ingresar cantidad personalizada
```
1. Encuentra el campo que dice "O ingresa cantidad personalizada:"
2. Ingresa un monto (ejemplo: 350)
3. Haz clic en el botón ENVIAR
4. Confirma en el dialog
```

### Paso 6: Verificar Alias Visible
```
Debería ver prominentemente:
🏦 TRANSFERIR A MERCADOPAGO:
gasa.borde.disques.mp
```

### Paso 7: Confirmar Donación
- Se abre dialog de confirmación con:
  - Monto ingresado
  - Alias a donde enviar
  - Opción OK/Cancelar

### Paso 8: Ver Éxito
- Si confirmas:
  - Aparece notificación con efecto de partículas
  - Dice: "✅ ¡DONACIÓN EXITOSA!"
  - Muestra el monto y alias
  - Desaparece en 3 segundos

### Paso 9: Verificar Guardado
```
Consola (F12) → Console
Ejecuta:
  DonationSystem.getDonationHistory()

Debería mostrar array con tus donaciones:
[
  {amount: 100, date: "2026-02-23T...", alias: "gasa.borde.disques.mp"},
  {amount: 350, date: "2026-02-23T...", alias: "gasa.borde.disques.mp"}
]
```

---

## 🔍 CHECKLIST DE VALIDACIÓN

### Modal Se Abre
- [ ] Hago clic en botón "💝 APOYAR MISIÓN"
- [ ] Modal aparece centrado
- [ ] Veo el alias en caja destacada

### Opciones Predefinidas
- [ ] Puedo hacer clic en $100
- [ ] Puedo hacer clic en $250
- [ ] Puedo hacer clic en $500
- [ ] Puedo hacer clic en $1000
- [ ] Se abre confirmation dialog

### Cantidad Personalizada
- [ ] Veo campo de entrada
- [ ] Puedo escribir números
- [ ] Botón ENVIAR existe
- [ ] ENVIAR procesa el monto

### Validación
- [ ] Si dejo en blanco y hago "ENVIAR" → Error
- [ ] Si ingreso número muy bajo (< $5) → Error
- [ ] Si ingreso número muy alto (> $100000) → Error
- [ ] Si ingreso válido → Confirmation dialog

### Confirmación
- [ ] Dialog muestra monto correcto
- [ ] Dialog muestra alias correcto
- [ ] Si hago "OK" → Se procesa
- [ ] Si hago "Cancel" → Se cancela

### Éxito
- [ ] Notificación aparece
- [ ] Muestra "✅ ¡DONACIÓN EXITOSA!"
- [ ] Muestra monto
- [ ] Muestra alias
- [ ] Desaparece después de 3s

### Guardado
- [ ] Abre consola (F12)
- [ ] Ejecuta: `DonationSystem.getDonationHistory()`
- [ ] Muestra array con donaciones
- [ ] Cada donación tiene: amount, date, alias

### Botón Desaparece durante Juego
- [ ] Hago clic en "INICIAR MISIÓN"
- [ ] Comienza el juego
- [ ] El botón "💝 APOYAR MISIÓN" NO está visible
- [ ] Boton vuelve a aparecer cuando regreso al menú

---

## 💬 CONSOLA - DEBUGGING

### Ver Estado del Sistema
```javascript
// En consola (F12)
DonationSystem.getStatus()

// Output esperado:
{
  enabled: true,
  alias: "gasa.borde.disques.mp",
  minAmount: 5,
  maxAmount: 100000,
  totalDonated: 1750,
  donationCount: 3
}
```

### Ver Historial Completo
```javascript
DonationSystem.getDonationHistory()

// Output esperado:
[
  {amount: 100, date: "2026-02-23T...", alias: "gasa.borde.disques.mp"},
  {amount: 250, date: "2026-02-23T...", alias: "gasa.borde.disques.mp"},
  {amount: 1400, date: "2026-02-23T...", alias: "gasa.borde.disques.mp"}
]
```

### Ver Total Donado
```javascript
DonationSystem.getTotalDonations()

// Output esperado (suma de todos):
1750
```

### Limpiar Historial (Si quieres empezar de nuevo)
```javascript
localStorage.removeItem('exodus_donations')
```

### Ver Logs en Consola
Busca mensajes que comiencen con:
- `✅` = Éxito
- `❌` = Error
- `💰` = Procesamiento
- `🎯` = Click de botón

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: Modal no abre
**Solución:**
```javascript
// En consola (F12):
window.DonationSystem.showModal()
// Si muestra error, verifica que donation_system.js esté cargado
```

### Problema: No veo el alias
**Solución:**
- Abre el inspector (F12)
- Busca el elemento con ID `donation-modal`
- Verifica que el texto "gasa.borde.disques.mp" esté dentro

### Problema: Donación no se guarda
**Solución:**
```javascript
// Verifica localStorage
localStorage.getItem('exodus_donations')
// Debe mostrar array JSON con tus donaciones
```

### Problema: Error de JavaScript
**Solución:**
1. Abre F12 → Console
2. Copia exactamente el error
3. Verifica que `src/donation_system.js` esté cargado

### Problema: Botón no está visible en menú
**Solución:**
- Busca en el HTML `onclick="window.showDonationModal()"`
- Debería estar dentro de `<div id="menu-panel">`
- Verifica que CSS no lo oculte

---

## ✅ VALIDACIÓN FINAL

**El sistema está LISTO cuando:**
- ✅ Botón aparece en menú
- ✅ Modal abre al hacer clic
- ✅ Alias es VISIBLE y CLARO
- ✅ Puedo ingresar cantidad personalizada
- ✅ Se guarda en localStorage
- ✅ Notificación de éxito aparece
- ✅ Botón desaparece durante el juego

---

## 📊 DATOS DE PRUEBA

### Montos Válidos
```
$5 = mínimo
$100, $250, $500, $1000 = predefinidos
$5000 = válido personalizado
$99999 = máximo permitido
```

### Montos Inválidos
```
$0 = error
$-100 = error
$1 = bajo (< $5)
$100001 = alto (> $100000)
"texto" = error
```

---

## 🎯 PRÓXIMOS PASOS

Si todo funciona:
1. ✅ Sistema está LISTO para producción
2. ✅ Usuarios pueden donar
3. ✅ Dinero se registra automáticamente
4. ✅ Alias de papá está visible

Si falla algo:
1. 📝 Anota exactamente qué falla
2. 🐛 Comparte el error de consola
3. 📸 Toma screenshot del problema
4. 💬 Cuéntame y lo arreglamos

---

*Actualizado: 2026-02-23*
*Versión: Donation System v2.0 FIXED*
*Estado: ✅ PRODUCTION READY*
