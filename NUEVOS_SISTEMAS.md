# 🚀 EXODUS EDITION - NUEVOS SISTEMAS

## 📊 SISTEMA DE RANGOS DINÁMICOS (S+, S, A, B, C, D)

El rango final se calcula basado en:
- **Precisión** (20%): % de disparos que dieron en el blanco
- **Daño Recibido** (30%): Penaliza recibir mucho daño
- **Combo Máximo** (25%): Bonus por combos altos
- **Tiempo de Juego** (15%): Bonus por terminar rápido
- **Jefes Eliminados** (10%): Bonus por matar jefes

**Rangos:**
- `S+` (950+): ¡PERFECTO! Legendario piloto
- `S` (850): ¡INCREÍBLE! Destreza excepcional
- `A` (750): ¡MUY BIEN! Valiante guerrero
- `B` (650): Bien jugado, sobreviviste
- `C` (500): Luchaste pero necesitas mejorar
- `D` (0): Apenas sobreviviste

---

## 🏆 MEMORIAL ÉPICO - RECORDAR TUS LOGROS

Al terminar una partida, verás:

1. **Tarjeta de Estadísticas Holográfica**
   - Tu rango gigante con efecto glow
   - Precisión, Enemigos, Jefes
   - Score total del 1 a 1000

2. **Timeline Cinematográfico**
   - Lista de hitos de tu partida
   - Animación de escritura (typing effect)
   - Fondo con partículas doradas flotantes

3. **Leyendas de Exodus**
   - Las 5 mejores partidas guardadas
   - Ver en el menú bajo "LEYENDAS"
   - Datos: Rango, Score, Tiempo, Enemigos derrotados

---

## 🎨 SISTEMA DE 20 COSMÉTICOS ÉPICOS

### Cosméticos disponibles:

**Tier 1 - Clásicos:**
0. Nave Clásica (sin efectos)
1. Infierno Rojo - Estela de fuego
2. Neón Azul - Rastro eléctrico
3. Estrella Dorada - Brillo celestial

**Tier 2 - Sci-Fi:**
4. Sombra Fantasmagórica - Aura púrpura
5. Tormenta de Plasma - Descargas verdes
6. Materia Oscura - Absorción del vacío
7. Cristal de Hielo - Fragmentos congelados

**Tier 3 - Elementales:**
8. Llamarada Solar - Calor intenso
9. Eco del Vacío - Ecos dimensionales
10. Rayo Destructivo - Descarga continua
11. Polvo Cósmico - Polvo de estrellas

**Tier 4 - Exóticos:**
12. Aura Esmeralda - Brillo esmeralda
13. Salto Cuántico - Distorsión cuántica
14. Núcleo de Titanio - Blindaje metálico
15. Fuego Fénix - Llamas del renacimiento

**Tier 5 - Legendarios:**
16. Ventisca Ártica - Tormenta de nieve
17. Núcleo Fundido - Magma incandescente
18. Espejismo Luminoso - Destellos cambiantes
19. Comandante del Vacío - El poder supremo

**Características:**
- Cada cosmético cambia el color de tu nave
- Algunos incluyen efectos de partículas (chispas, polvo, etc.)
- Se guardan en localStorage automáticamente
- Los efectos de partículas aparecen continuamente cerca de tu nave

### Cómo cambiar cosmético:
1. En el Menú Principal
2. Haz clic en la pestaña "COSMÉTICOS"
3. Selecciona uno de los 20 opciones
4. El efecto se aplica inversamente
5. Tu elección se guarda para la próxima sesión

---

## 🎵 SISTEMA DE MÚSICA YOUTUBE

### Canciones integradas:

**Para cada contexto:**

1. **Menú Principal**: HOME - Resonance
   - Synthwave espacial ambient
   - URL: https://youtu.be/2l0Oix5tqnQ

2. **Batallas/Jefes**: White Bat Audio - Horizon
   - Synthwave de acción épica
   - URL: https://youtu.be/S2w0pXD7F8U

3. **Sectores Lentos (Agujero Negro)**: 2814 - Birth of a New Day
   - Ambient atmosférico
   - URL: https://youtu.be/0T8bK3YKgJo

4. **Sector Final**: M.O.O.N - Dust
   - Cinemático épico
   - URL: https://youtu.be/WnGF-ECwUPA

### Controles:
- Bottom-left corner del juego
- Play/Pause/Stop
- Control de volumen (0-100%)
- Loop automático

---

## 💝 SISTEMA DE DONACIÓN

### Montos disponibles (Pesos Argentinos):

- **$100 ARS** - ☕ Café Cósmico
- **$250 ARS** - 🚀 Impulso Estelar
- **$500 ARS** - ⭐ Nave de Oro
- **$1000 ARS** - 👑 Comandante Supremo

### Cómo donar:
1. Haz clic en el botón "💝 APOYAR" (Top-right)
2. Selecciona el monto
3. Se mostrará confirmación
4. ¡Tu apoyo ayuda a mejorar el juego!

---

## 🔍 CARACTERÍSTICAS TÉCNICAS

### Persistencia en LocalStorage:
- Cosmético seleccionado (`exodus_selected_cosmetic`)
- Top 5 leyendas (`exodus_legends`)
- Color del cosmético (`exodus_cosmetic_color`)

### Rendimiento:
- Partículas doradas: 150 máximo concurrent
- Efectos de cosméticos: 50 máximo
- Timeline: Animación de 200ms entre eventos

### Compatibilidad:
- Electron 40.6.0
- Web Audio API
- YouTube IFrame API
- Canvas + WebGL

---

## 🐛 TROUBLESHOOTING

**P: Las partículas del cosmético no aparecen**
R: Verifica que `cosmetics_system_enhanced.js` esté cargado. Habilita la consola (F12) para ver errores.

**P: La música de YouTube no suena**
R: Asegúrate de tener conexión a internet. YouTube Player requiere conexión web.

**P: El Memorial no aparece al terminar**
R: Verifica que `memorial_system.js` esté cargado. Prueba presionando ESC para cerrar pausas.

**P: Las leyendas no se guardan**
R: LocalStorage puede estar bloqueado. Verifica en Settings → Privacy que allows LocalStorage.

---

## 📈 PRÓXIMAS MEJORAS

- [ ] Cosmético con animaciones personalizadas
- [ ] Sistema de logros desbloqueables
- [ ] Leaderboard online
- [ ] Más variedad de efectos de partículas
- [ ] Sistema de replay para grabar mejores jugadas
- [ ] Filtro CRT/scanlines retro

---

**¡Gracias por jugar EXODUS EDITION!** 🌌
