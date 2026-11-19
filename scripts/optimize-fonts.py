"""Optional asset preparation: python -m pip install fonttools brotli."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen
for name in ['inter-regular', 'inter-semibold', 'jetbrains-mono-regular']:
    source = Path('public/fonts') / (name + '.ttf')
    original = TTFont(source)
    original.flavor = 'woff2'
    target = source.with_suffix('.woff2')
    original.save(target)
    restored = TTFont(target)
    assert restored.getGlyphOrder() == original.getGlyphOrder()
    assert restored.getBestCmap() == original.getBestCmap()
    before, after = original.getGlyphSet(), restored.getGlyphSet()
    for glyph in original.getGlyphOrder():
        left, right = RecordingPen(), RecordingPen()
        before[glyph].draw(left)
        after[glyph].draw(right)
        assert left.value == right.value, glyph
    print(name, source.stat().st_size, target.stat().st_size, 'identical glyph outlines')
