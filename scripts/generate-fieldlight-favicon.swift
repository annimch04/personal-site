import AppKit
import Foundation

guard CommandLine.arguments.count == 3 else {
    fputs("usage: generate-fieldlight-favicon.swift SOURCE_CARD OUTPUT_PNG\n", stderr)
    exit(2)
}

let sourcePath = CommandLine.arguments[1]
let outputPath = CommandLine.arguments[2]

guard let source = NSImage(contentsOfFile: sourcePath) else {
    fputs("could not open source card: \(sourcePath)\n", stderr)
    exit(1)
}

let canvasSize = NSSize(width: 630, height: 630)
let canvas = NSImage(size: canvasSize)

canvas.lockFocus()
NSGraphicsContext.current?.imageInterpolation = .none

NSColor(
    calibratedRed: 7.0 / 255.0,
    green: 25.0 / 255.0,
    blue: 35.0 / 255.0,
    alpha: 1.0
).setFill()
NSBezierPath(rect: NSRect(origin: .zero, size: canvasSize)).fill()

// Preserve the complete right-hand field environment from the original card.
// AppKit source coordinates begin at the lower-left; the selected region is
// the original x=600...1200 across the full 630-pixel height. Fifteen pixels
// of navy margin remain on each side of the square canvas.
source.draw(
    in: NSRect(x: 15, y: 0, width: 600, height: 630),
    from: NSRect(x: 600, y: 0, width: 600, height: 630),
    operation: .copy,
    fraction: 1.0,
    respectFlipped: false,
    hints: [.interpolation: NSImageInterpolation.none]
)

// Remove the end of PARTICIPANT from an empty area left of the field. The
// replacement is untouched navy texture from the same original card.
source.draw(
    in: NSRect(x: 15, y: 300, width: 60, height: 160),
    from: NSRect(x: 520, y: 470, width: 60, height: 160),
    operation: .copy,
    fraction: 1.0,
    respectFlipped: false,
    hints: [.interpolation: NSImageInterpolation.none]
)

// Remove the end of the subtitle from the lower-left, again with untouched
// source texture. The nearest outer ring begins to the right of this patch.
source.draw(
    in: NSRect(x: 15, y: 90, width: 144, height: 60),
    from: NSRect(x: 400, y: 30, width: 144, height: 60),
    operation: .copy,
    fraction: 1.0,
    respectFlipped: false,
    hints: [.interpolation: NSImageInterpolation.none]
)

canvas.unlockFocus()

guard
    let tiff = canvas.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: tiff),
    let png = bitmap.representation(using: .png, properties: [:])
else {
    fputs("could not encode favicon source\n", stderr)
    exit(1)
}

do {
    try png.write(to: URL(fileURLWithPath: outputPath), options: .atomic)
} catch {
    fputs("could not write favicon source: \(error)\n", stderr)
    exit(1)
}
