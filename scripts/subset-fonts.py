"""Generate a small Latin face; full approved fonts remain the fallback for other scripts."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen
# Latin, punctuation, currency, arrows and common technical symbols.
points = set(range(0x0000, 0x0250)) | set(range(0x2000, 0x2070)) | set(range(0x20A0, 0x20D0)) | set(range(0x2190, 0x2200)) | set(range(0x25A0, 0x2600)) | {0x2713, 0x2714, 0xFEFF, 0xFFFD}
for name in ['inter-regular', 'inter-semibold', 'jetbrains-mono-regular']:
    original = TTFont(Path('public/fonts') / (name + '.woff2'))
    font = TTFont(Path('public/fonts') / (name + '.woff2'))
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    options.glyph_names = True
    worker = subset.Subsetter(options=options)
    worker.populate(unicodes=points)
    worker.subset(font)
    target = Path('public/fonts') / (name + '-latin.woff2')
    font.save(target)
    restored = TTFont(target)
    before, after = original.getGlyphSet(), restored.getGlyphSet()
    for point, glyph in restored.getBestCmap().items():
        source = original.getBestCmap()[point]
        left, right = RecordingPen(), RecordingPen()
        before[source].draw(left)
        after[glyph].draw(right)
        assert left.value == right.value, (name, point)
    print(name, target.stat().st_size, 'retained outlines verified')
