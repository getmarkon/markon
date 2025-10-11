#!/bin/bash

fc-list | grep 'Qurova DEMO' &>/dev/null && inkscape \
  -w 500 -h 120 wordmark-font.svg --export-type svg --export-text-to-path -o wordmark.svg
inkscape -w 500 -h 120 wordmark.svg --export-type png -o wordmark.png
inkscape -w 200 -h 200 logo.svg --export-type png -o logo.png

# vim: ft=bash
