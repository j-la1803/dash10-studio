"""Move the approved MP4's metadata before its media; encoded samples stay identical."""
from pathlib import Path
import hashlib
import struct

source = Path('public/videos/dash-10-video-bg.mp4')
target = Path('public/videos/dash-10-video-bg-faststart.mp4')
data = source.read_bytes()

def atoms(buffer, start=0, end=None):
    end = len(buffer) if end is None else end
    while start < end:
        size, kind = struct.unpack_from('>I4s', buffer, start)
        header = 8
        if size == 1:
            size = struct.unpack_from('>Q', buffer, start + 8)[0]
            header = 16
        if not size:
            size = end - start
        if size < header or start + size > end:
            raise ValueError('Invalid MP4 atom bounds')
        yield start, size, kind, header
        start += size

root = list(atoms(data))
moov = next(a for a in root if a[2] == b'moov')
mdat = next(a for a in root if a[2] == b'mdat')
if moov[0] < mdat[0]:
    raise ValueError('Source is already optimized; do not remux again')
metadata = bytearray(data[moov[0]:moov[0] + moov[1]])
containers = {b'moov', b'trak', b'mdia', b'minf', b'stbl'}
patched = 0

def patch(start=0, end=None):
    global patched
    for offset, size, kind, header in atoms(metadata, start, end):
        if kind in containers:
            patch(offset + header, offset + size)
        elif kind in {b'stco', b'co64'}:
            count = struct.unpack_from('>I', metadata, offset + header + 4)[0]
            fmt, width = ('>I', 4) if kind == b'stco' else ('>Q', 8)
            for index in range(count):
                position = offset + header + 8 + index * width
                original = struct.unpack_from(fmt, metadata, position)[0]
                if not mdat[0] + mdat[3] <= original < mdat[0] + mdat[1]:
                    raise ValueError('Unexpected media offset')
                struct.pack_into(fmt, metadata, position, original + moov[1])
                patched += 1

patch()
if not patched:
    raise ValueError('No sample offsets found')
output = bytearray()
for offset, size, kind, _ in root:
    if kind == b'moov':
        continue
    if kind == b'mdat':
        output.extend(metadata)
    output.extend(data[offset:offset + size])
new_mdat = next(a for a in atoms(output) if a[2] == b'mdat')
original_samples = data[mdat[0] + mdat[3]:mdat[0] + mdat[1]]
new_samples = output[new_mdat[0] + new_mdat[3]:new_mdat[0] + new_mdat[1]]
assert original_samples == new_samples
assert len(output) == len(data)
target.write_bytes(output)
print({'bytes': len(output), 'sample_offsets_patched': patched,
       'identical_media_sha256': hashlib.sha256(new_samples).hexdigest()})
