#!/bin/sh
# Rebuild the homepage asset from the original 141-frame mountain clip.
# FFMPEG may point to a local encoder; no encoder is shipped to the browser.
set -eu
"${FFMPEG:-ffmpeg}" -hide_banner -y \
  -i public/videos/dash-10-video-bg.mp4 \
  -filter_complex '[0:v]split[f][r];[r]reverse,trim=start_frame=1:end_frame=140,setpts=PTS-STARTPTS[back];[f][back]concat=n=2:v=1:a=0,setpts=5*(PTS-STARTPTS),fps=30[v]' \
  -map '[v]' -an -c:v libx264 -preset slow -crf 24 \
  -pix_fmt yuv420p -movflags +faststart public/videos/dash10-mountain-loop.mp4
