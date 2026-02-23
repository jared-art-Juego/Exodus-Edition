# 🎵 VECTOR EXODUS - Audio Structure & Implementation Guide

## Directory Structure

```
assets/
└── audio/
    ├── music/
    │   ├── menu_theme.wav
    │   ├── sector1_base.wav
    │   ├── sector1_boss_layer1.wav
    │   ├── sector1_boss_layer2.wav
    │   ├── sector1_boss_layer3.wav
    │   ├── sector2_base.wav
    │   ├── sector2_boss.wav
    │   ├── sector3_base.wav
    │   ├── sector3_boss.wav
    │   ├── sector4_base.wav
    │   ├── sector4_boss.wav
    │   ├── sector5_base.wav
    │   ├── sector5_boss.wav
    │   ├── sector6_base.wav
    │   ├── sector6_boss_layer1.wav
    │   ├── sector6_boss_layer2.wav
    │   ├── sector6_boss_layer3.wav
    │   ├── victory_theme.wav
    │   └── defeat_theme.wav
    └── sfx/
        ├── shoot.wav
        ├── explosion.wav
        ├── hit.wav
        ├── powerup.wav
        ├── boss_phase_change.wav
        └── ui_click.wav
```

## Audio File Specifications

### Music Files
- **Format**: WAV (uncompressed) or OGG (compressed, recommended for performance)
- **Sample Rate**: 44.1 kHz (industry standard for games)
- **Bit Depth**: 16-bit
- **Duration**: 60-180 seconds (looping compatible)
- **Channels**: Stereo (2 channels)
- **Loop Points**: Clearly marked with metadata

### SFX Files
- **Format**: WAV or OGG
- **Sample Rate**: 22.05 kHz (sufficient for sound effects)
- **Bit Depth**: 16-bit
- **Duration**: 0.5-3 seconds
- **Format**: Use MP3 (crate_explosion.mp3 exists as reference)

## MusicManager Integration

The `MusicManager` module handles:
- Layered music for dynamic difficulty
- Smooth fade in/out transitions
- Cross-fading between sectors
- Volume management
- Persistent saving of audio preferences

### Key Methods

```javascript
// Initialize
MusicManager.init(game);

// Play music
MusicManager.playMenu();           // Menu theme
MusicManager.playSector(sector);   // Sector base music
MusicManager.playBoss(sector);     // Boss music (auto-layers for Sector 1)

// Update dynamic layers (mainly Sector 1)
MusicManager.updateBossLayers(hpPercent); // 0 to 1

// Volume control
MusicManager.setMasterVolume(0.7);
MusicManager.setMusicVolume(0.6);
MusicManager.setSfxVolume(1.0);

// Transitions
MusicManager.transitionToGameplay();
MusicManager.backToCombat(sector);
MusicManager.playVictory();
MusicManager.playDefeat();
```

## Sector 1 Music Dynamics

### Layered System
The music for Sector 1 boss progressively intensifies:

- **100%-51% HP**: Layer 1 only (base)
- **50%-11% HP**: Layer 1 + Layer 2 (medium intensity)
- **10%-0% HP**: All layers (maximum intensity)

### Implementation
```javascript
// Automatically triggered on HP changes
if (bossHpPercent > 0.5) {
    // Play layer 1 only
} else if (bossHpPercent > 0.1) {
    // Fade in layer 2, keep layer 1
} else {
    // Fade in layer 3, keep 1 + 2
}
```

### Sector 6 Music (Alternative)
Sector 6 uses a similar approach but can be customized:
- Phase 1 (0-50s): Base music
- Phase 2 (50-180s): Intense music
- Phase 3 (180+s): Final phase music

## Recommended Royalty-Free Sources

### Where to Find Suitable Music:
1. **Pixabay Music**: https://pixabay.com/music/
   - Search: "dark techno", "sci-fi", "action"
   - Filter: Download for free
   - Attribute as per license

2. **Itch.io Game Assets**: https://itch.io/game-assets/tag-music
   - Many free and commercial options
   - Check license before use

3. **OpenGameArt**: https://opengameart.org/
   - Community-created content
   - Dedicated game music section

4. **Incompetech**: https://incompetech.com/music/
   - High-quality instrumental music
   - Attribution required

5. **YouTube Audio Library**: YouTube Creator Studio
   - Free background music
   - Royalty-free licensed

## Audio Implementation Checklist

- [ ] Place all WAV/OGG files in `assets/audio/music/` directory
- [ ] Verify file naming matches MusicManager expectations
- [ ] Test audio playback in index.html
- [ ] Confirm loops are seamless (no clicking/popping)
- [ ] Adjust volume levels so no clipping occurs
- [ ] Test transitions between sector musics
- [ ] Verify boss layer system works (Sector 1)
- [ ] User volume preferences persist (localStorage)
- [ ] Audio doesn't re-trigger on unnecessary transitions

## Technical Notes

### Why WAV vs MP3/OGG?
- **WAV**: Better for looping, no compression artifacts
- **OGG**: Smaller file size, good quality, streaming-friendly
- **Recommendation**: Use OGG for final build to reduce download size

### Performance Considerations
- The MusicManager uses an audio object pool to prevent memory leaks
- Maximum 5 simultaneous audio objects (menu + base + 3 boss layers)
- Unused audio contexts are properly cleaned and disposed
- LocalStorage stores volume preferences (minimal impact)

### Browser Compatibility
- Modern browsers support Web Audio API
- Fallback: Use HTML5 `<audio>` tags for basic playback
- Test on Chrome, Firefox, Safari, Edge

## Volume Levels Guide

| Element | Recommended Level | Min | Max |
|---------|------------------|-----|-----|
| Master | 0.7 | 0.0 | 1.0 |
| Music | 0.6 | 0.0 | 1.0 |
| SFX | 1.0 | 0.0 | 1.0 |

**Formula**: `finalVolume = masterVolume × categoryVolume × elementVolume`

## Troubleshooting

### Music Doesn't Play
1. Check browser console for 404 errors
2. Verify file names match exactly (case-sensitive on Linux/Mac)
3. Check browser audio permissions
4. Verify CORS headers if serving from server

### Music Stutters or Pops
1. Re-export audio file without compression artifacts
2. Ensure loop points are sample-accurate
3. Check browser CPU usage
4. Reduce number of simultaneous audio tracks

### Volume Issues
1. Verify mixer levels in audio file itself
2. Check localStorage for saved volume settings
3. Test with master volume slider
4. Ensure normalizing to -3dB peaks

## Future Enhancements

- [ ] Add procedural music generation via WebAudio API
- [ ] Implement dynamic mixing based on gameplay state
- [ ] Add difficulty-based track selection
- [ ] Support for player-custom playlists
- [ ] Real-time audio analysis for visual sync

---

**Last Updated**: February 22, 2026
**Version**: 1.0.0
**System**: VECTOR EXODUS - EXODUS EDITION
