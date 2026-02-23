/**
 * EJEMPLOS DE INTEGRACIÓN - NUEVOS SISTEMAS
 * Muestra cómo usar Rank System, Memorial, Cosméticos y YouTube Player
 */

// ============================================================
// 1. USAR EL SISTEMA DE RANGOS
// ============================================================

const gameStats = {
    accuracy: 85,              // 0-100
    damageReceived: 250,       // Total damage taken
    maxCombo: 45,              // Highest combo reached
    playTimeSeconds: 180,      // Game duration
    enemiesDefeated: 42,       // Total enemies killed
    bossesDefeated: 2,         // Total bosses killed
    shotsFired: 500,           // Total shots fired
    shotsHit: 425              // Shots that hit
};

// Calcular rango
const rankResult = RankSystem.calculateRank(gameStats);

console.log(`Rango: ${rankResult.rank}`);
console.log(`Score: ${rankResult.score}/1000`);
console.log(`Color: ${rankResult.color}`);
console.log(`Descripción: ${RankSystem.getGradeDescription(rankResult.rank)}`);

// ============================================================
// 2. MOSTRAR MEMORIAL ÉPICO AL TERMINAR PARTIDA
// ============================================================

// Hitos importantes durante la partida
const milestones = [
    { time: '00:15', text: 'Derrotaste tu primer enemigo' },
    { time: '01:30', text: 'Combo x10 alcanzado!' },
    { time: '02:45', text: 'Derrotaste a The Scrapper (Jefe 1)' },
    { time: '04:20', text: 'Vida crítica (<20%) - ¡Sobreviviste!' },
    { time: '06:00', text: '⚡ POWER UP: Daño +25%' },
    { time: '08:15', text: 'Combo x50 máximo - ¡LEGENDARIO!' },
    { time: '10:30', text: 'Derrotaste a Helios Prime (Jefe 2)' }
];

// Mostrar pantalla de memorial (normalmente se llama al perder/ganar)
setTimeout(() => {
    MemorialSystem.showMemorial(gameStats, milestones);
}, 3000);

// ============================================================
// 3. INTEGRAR CON EVENTOS DEL JUEGO
// ============================================================

// Al iniciar el juego
window.addEventListener('gameStart', () => {
    console.log('Juego iniciado - Reproduciendo música de batalla...');
    if (window.YouTubePlayer) {
        YouTubePlayer.playMenuMusic();
    }
});

// Cuando el usuario mata un enemigo
function onEnemyKilled(enemyData) {
    // Actualizar estadísticas
    gameStats.enemiesDefeated++;
    gameStats.shotsFired++;
    gameStats.shotsHit++;
    
    // Reproducir efecto de sonido
    if (window.VisualEffectsUI) {
        VisualEffectsUI.playSoundEffect(440, 0.1, 0.5);
    }
}

// Cuando el jugador recibe daño
function onPlayerDamage(damageAmount) {
    gameStats.damageReceived += damageAmount;
    
    // Efecto visual
    if (window.VisualEffectsUI) {
        VisualEffectsUI.shakeScreen(200, 5);
    }
    
    // Screen flash rojo si vida es baja
    if (playerHP < playerMaxHP * 0.2) {
        document.body.style.filter = 'invert(0.2)';
        setTimeout(() => {
            document.body.style.filter = 'invert(0)';
        }, 100);
    }
}

// Cuando termina una ola (oleada)
function onWaveComplete(waveNumber) {
    console.log(`Oleada ${waveNumber} completada!`);
}

// Al entrar a jefe
function onBossStart(bossName) {
    console.log(`¡Jefe encontrado: ${bossName}!`);
    
    // Cambiar música de batalla
    if (window.YouTubePlayer) {
        YouTubePlayer.playBossMusic();
    }
    
    // Fade in de tensión
    if (window.YouTubePlayer) {
        YouTubePlayer.fadeIn(1000);
    }
}

// Al derrotar jefe
function onBossDefeated(bossName) {
    gameStats.bossesDefeated++;
    console.log(`¡Derrotaste a ${bossName}!`);
    
    // Agregar al timeline
    const time = formatTime(gameStats.playTimeSeconds);
    milestones.push({
        time: time,
        text: `Derrotaste a ${bossName}`
    });
    
    // Efecto especial
    if (window.VisualEffectsUI) {
        VisualEffectsUI.shakeScreen(500, 20);
    }
}

// ============================================================
// 4. CARGAR/GUARDAR COSMÉTICOS
// ============================================================

// Al iniciar juego, cargar cosmético guardado
function initializeCosmetics() {
    if (window.CosmeticsSystem) {
        CosmeticsSystem.init();
        
        const selected = CosmeticsSystem.getSelectedCosmetic();
        console.log(`Cosmético activo: ${selected.name}`);
        
        // Aplicar color a tu nave
        const shipElement = document.querySelector('.nave');
        if (shipElement && selected.color) {
            shipElement.style.filter = `drop-shadow(0 0 15px ${selected.color})`;
        }
    }
}

// Cambiar cosmético desde código
function changeCosmetic(cosmeticId) {
    if (window.CosmeticsSystem) {
        CosmeticsSystem.applyCosmetic(cosmeticId);
    }
}

// ============================================================
// 5. USAR YOUTUBE PLAYER
// ============================================================

// Inicializar reproductor
async function initMusic() {
    if (window.YouTubePlayer) {
        await YouTubePlayer.init();
        YouTube YoutubePlayer.playMenuMusic();
    }
}

// Cambiar música según sector
function playMusicForSector(sectorNumber) {
    if (!window.YouTubePlayer) return;
    
    switch(sectorNumber) {
        case 5: // Agujero Negro - música lenta
            YouTubePlayer.playSlowSectorMusic();
            break;
        case 6: // Sector Final - música épica
            YouTubePlayer.playFinalSectorMusic();
            break;
        default:
            YouTubePlayer.playBossMusic();
    }
}

// Control manual de volumen
function setMusicVolume(percentage) {
    if (window.YouTubePlayer) {
        YouTubePlayer.setVolume(percentage);
    }
}

// Fade out - cuando termina partida
function fadeOutMusic() {
    if (window.YouTubePlayer) {
        YouTubePlayer.fadeOut(2000);
    }
}

// ============================================================
// 6. ACCEDER A LEYENDAS GUARDADAS
// ============================================================

function displayTopLegends() {
    const legends = MemorialSystem.getLegends();
    
    console.log('🏆 TOP 5 LEYENDAS:');
    legends.forEach((legend, idx) => {
        console.log(`${idx + 1}. Rango ${legend.rank} - Score: ${legend.score}`);
    });
    
    return legends;
}

// Exportar para juego compartido
function shareHighScore(rankData) {
    const message = `Acabo de conseguir rango ${rankData.rank} con score ${rankData.score} en EXODUS EDITION! 🚀`;
    console.log(message);
    // Aquí podrías enviar a una API o mostrar en redes sociales
}

// ============================================================
// 7. MANEJO DE GAME OVER / VICTORIA
// ============================================================

function onGameOver(wasVictory) {
    // Calcular estadísticas finales
    gameStats.accuracy = (gameStats.shotsHit / gameStats.shotsFired * 100) || 0;
    gameStats.playTimeSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
    
    // Generar hitos adicionales
    if (wasVictory) {
        milestones.push({
            time: formatTime(gameStats.playTimeSeconds),
            text: '🎉 ¡VICTORIA! Completaste la misión'
        });
    } else {
        milestones.push({
            time: formatTime(gameStats.playTimeSeconds),
            text: '💀 Fue una buena lucha, Piloto'
        });
    }
    
    // Mostrar memorial
    MemorialSystem.showMemorial(gameStats, milestones);
    
    // Música de derrota/victoria
    fadeOutMusic();
    setTimeout(() => {
        YouTubePlayer.stop();
    }, 2000);
}

// Auxiliar: Formatear tiempo
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ============================================================
// 8. INICIALIZACIÓN COMPLETA
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todos los sistemas
    initializeCosmetics();
    initMusic();
    
    // Escuchar eventos de juego
    window.addEventListener('playerDamage', (e) => onPlayerDamage(e.detail.amount));
    window.addEventListener('enemyKilled', (e) => onEnemyKilled(e.detail));
    window.addEventListener('waveComplete', (e) => onWaveComplete(e.detail.wave));
    window.addEventListener('bossStart', (e) => onBossStart(e.detail.name));
    window.addEventListener('bossDefeated', (e) => onBossDefeated(e.detail.name));
    window.addEventListener('gameOver', (e) => onGameOver(e.detail.victory));
});

// ============================================================
// 9. DISPARAR EVENTOS DESDE TU CÓDIGO
// ============================================================

// Ejemplo: En tu loop de actualización del enemigo
function updateEnemy(enemy) {
    if (enemy.hp <= 0) {
        // Disparar evento
        const event = new CustomEvent('enemyKilled', {
            detail: {
                name: enemy.name,
                points: enemy.points
            }
        });
        window.dispatchEvent(event);
    }
}

// Ejemplo: Cuando recibe daño
function damagePlayer(amount) {
    playerHP -= amount;
    
    const event = new CustomEvent('playerDamage', {
        detail: { amount: amount }
    });
    window.dispatchEvent(event);
    
    if (playerHP <= 0) {
        const gameOverEvent = new CustomEvent('gameOver', {
            detail: { victory: false }
        });
        window.dispatchEvent(gameOverEvent);
    }
}

console.log('✅ Ejemplos de integración cargados. Usa estos patrones en tu juego.');
