import SwiftUI
import AVFoundation
import UniformTypeIdentifiers

// TAPE LAB v0.1 — file playback and waveform seeking.
// Single-file SwiftUI app for iPad Swift Playgrounds.
// This version does NOT implement audible reverse scrubbing.

private enum Palette {
    static let bg = Color(red: 0.035, green: 0.045, blue: 0.041)
    static let panel = Color(red: 0.07, green: 0.085, blue: 0.078)
    static let green = Color(red: 0.65, green: 0.94, blue: 0.70)
    static let dim = Color(red: 0.51, green: 0.58, blue: 0.53)
}

@MainActor
final class TapeEngine: ObservableObject {
    @Published private(set) var name = "NO AUDIO LOADED"
    @Published private(set) var duration: TimeInterval = 0
    @Published private(set) var position: TimeInterval = 0
    @Published private(set) var playing = false
    @Published private(set) var peaks: [CGFloat] = []
    @Published var error: String?

    private var player: AVAudioPlayer?
    private var ticker: Timer?
    private let savedKey = "tapeLab.v01.savedAudio"

    private var documents: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    init() {
        if let name = UserDefaults.standard.string(forKey: savedKey) {
            let url = documents.appendingPathComponent(name)
            if FileManager.default.fileExists(atPath: url.path) {
                do { try load(url) }
                catch { error = "Could not restore audio: \(error.localizedDescription)" }
            }
        }
    }

    func importAudio(_ url: URL) {
        let scoped = url.startAccessingSecurityScopedResource()
        defer { if scoped { url.stopAccessingSecurityScopedResource() } }

        do {
            let ext = url.pathExtension.lowercased()
            guard ["wav", "aif", "aiff", "m4a", "mp3", "caf"].contains(ext) else {
                throw TapeFailure.unsupported
            }
            let destination = documents.appendingPathComponent("tape-\(UUID().uuidString).\(ext)")
            try FileManager.default.copyItem(at: url, to: destination)
            do {
                try load(destination)
                let oldName = UserDefaults.standard.string(forKey: savedKey)
                UserDefaults.standard.set(destination.lastPathComponent, forKey: savedKey)
                if let oldName, oldName != destination.lastPathComponent {
                    try? FileManager.default.removeItem(at: documents.appendingPathComponent(oldName))
                }
                error = nil
            } catch {
                try? FileManager.default.removeItem(at: destination)
                throw error
            }
        } catch {
            self.error = "Import failed: \(error.localizedDescription)"
        }
    }

    private func load(_ url: URL) throws {
        let next = try AVAudioPlayer(contentsOf: url)
        guard next.prepareToPlay() else { throw TapeFailure.unplayable }
        player?.stop()
        player = next
        name = url.lastPathComponent
        duration = next.duration
        position = 0
        playing = false
        peaks = Self.waveform(url: url)
        if ticker == nil {
            ticker = Timer.scheduledTimer(withTimeInterval: 0.06, repeats: true) { [weak self] _ in
                Task { @MainActor [weak self] in self?.refresh() }
            }
        }
    }

    func toggle() {
        guard let player else { return }
        if player.isPlaying {
            pause()
        } else {
            if player.currentTime >= max(0, duration - 0.03) { player.currentTime = 0 }
            if player.play() {
                playing = true
                position = player.currentTime
            } else {
                error = "Audio output could not start."
            }
        }
    }

    func pause() {
        player?.pause()
        playing = false
    }

    func stop() {
        player?.stop()
        player?.currentTime = 0
        position = 0
        playing = false
    }

    func seek(_ fraction: Double) {
        guard let player, duration > 0 else { return }
        player.currentTime = min(max(fraction, 0), 1) * duration
        position = player.currentTime
    }

    private func refresh() {
        guard let player else { return }
        if player.isPlaying {
            position = player.currentTime
            playing = true
        } else if playing {
            position = min(player.currentTime, duration)
            playing = false
        }
    }

    private static func waveform(url: URL) -> [CGFloat] {
        // Audio analysis is for display only; playback always uses the source file.
        do {
            let file = try AVAudioFile(forReading: url, commonFormat: .pcmFormatFloat32, interleaved: false)
            let count = 300
            let length = max(file.length, 1)
            var bins = [Float](repeating: 0, count: count)
            guard let buffer = AVAudioPCMBuffer(pcmFormat: file.processingFormat, frameCapacity: 8192) else {
                return []
            }
            var offset: Int64 = 0
            while offset < file.length {
                try file.read(into: buffer, frameCount: 8192)
                let frames = Int(buffer.frameLength)
                guard frames > 0, let channels = buffer.floatChannelData else { break }
                let channelCount = Int(buffer.format.channelCount)
                for i in stride(from: 0, to: frames, by: max(1, frames / 1024)) {
                    let column = min(count - 1, Int((offset + Int64(i)) * Int64(count) / length))
                    var level: Float = 0
                    for c in 0..<channelCount {
                        level = max(level, abs(channels[c][i]))
                    }
                    bins[column] = max(bins[column], level)
                }
                offset += Int64(frames)
            }
            let maxPeak = max(bins.max() ?? 0, 0.001)
            return bins.map { CGFloat(min($0 / maxPeak, 1)) }
        } catch {
            return []
        }
    }
}

private enum TapeFailure: LocalizedError {
    case unsupported, unplayable
    var errorDescription: String? {
        switch self {
        case .unsupported: return "Choose WAV, AIFF, M4A, MP3 or CAF."
        case .unplayable: return "The audio file cannot be played."
        }
    }
}

private struct Waveform: View {
    let peaks: [CGFloat]
    let progress: CGFloat

    var body: some View {
        Canvas { context, size in
            let middle = size.height / 2
            var axis = Path()
            axis.move(to: CGPoint(x: 0, y: middle))
            axis.addLine(to: CGPoint(x: size.width, y: middle))
            context.stroke(axis, with: .color(Palette.dim.opacity(0.45)), lineWidth: 1)
            guard !peaks.isEmpty else { return }
            let spacing = size.width / CGFloat(peaks.count)
            for (index, peak) in peaks.enumerated() {
                let x = (CGFloat(index) + 0.5) * spacing
                let height = max(1.5, peak * size.height * 0.43)
                var bar = Path()
                bar.move(to: CGPoint(x: x, y: middle - height))
                bar.addLine(to: CGPoint(x: x, y: middle + height))
                context.stroke(bar, with: .color(x <= size.width * progress ? Palette.green : Palette.dim), lineWidth: max(1, spacing * 0.65))
            }
            let x = size.width * progress
            var cursor = Path()
            cursor.move(to: CGPoint(x: x, y: 0))
            cursor.addLine(to: CGPoint(x: x, y: size.height))
            context.stroke(cursor, with: .color(.white), lineWidth: 1.5)
        }
    }
}

struct TapeScreen: View {
    @StateObject private var engine = TapeEngine()
    @State private var showFiles = false

    private var progress: CGFloat {
        guard engine.duration > 0 else { return 0 }
        return CGFloat(min(max(engine.position / engine.duration, 0), 1))
    }

    private func clock(_ seconds: TimeInterval) -> String {
        guard seconds.isFinite && seconds >= 0 else { return "00:00" }
        return String(format: "%02d:%02d", Int(seconds) / 60, Int(seconds) % 60)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            HStack {
                Circle().fill(Palette.green).frame(width: 9, height: 9)
                Text("TAPE LAB").font(.system(size: 15, weight: .semibold, design: .monospaced))
                    .tracking(3)
                Spacer()
                Text("v0.1 AUDIO FOUNDATION").font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Palette.dim)
            }

            Text("TAPE").font(.system(size: 56, weight: .light, design: .monospaced))
                .foregroundStyle(Palette.green)

            VStack(alignment: .leading, spacing: 18) {
                HStack {
                    Text(engine.name).lineLimit(1).truncationMode(.middle)
                    Spacer()
                    Text("\(clock(engine.position)) / \(clock(engine.duration))").monospacedDigit()
                }
                .font(.system(size: 13, design: .monospaced))
                .foregroundStyle(Palette.dim)

                GeometryReader { geometry in
                    ZStack {
                        Waveform(peaks: engine.peaks, progress: progress)
                        if engine.peaks.isEmpty {
                            Text(engine.duration > 0 ? "WAVEFORM UNAVAILABLE" : "IMPORT AUDIO TO BEGIN")
                                .foregroundStyle(Palette.dim)
                                .font(.system(size: 13, design: .monospaced))
                        }
                    }
                    .contentShape(Rectangle())
                    .gesture(
                        DragGesture(minimumDistance: 0)
                            .onChanged { value in
                                guard engine.duration > 0 else { return }
                                engine.pause()
                                engine.seek(Double(value.location.x / max(geometry.size.width, 1)))
                            }
                    )
                }
                .frame(minHeight: 130)

                HStack {
                    Text("TOUCH = PAUSE + SEEK")
                    Spacer()
                    Text("SCRUB IS SILENT IN v0.1")
                }
                .foregroundStyle(Palette.dim)
                .font(.system(size: 10, design: .monospaced))
            }
            .padding(20)
            .background(Palette.panel, in: RoundedRectangle(cornerRadius: 8))
            .frame(maxHeight: .infinity)

            HStack(spacing: 12) {
                control("IMPORT", icon: "square.and.arrow.down", primary: false) {
                    showFiles = true
                }
                control(engine.playing ? "PAUSE" : "PLAY", icon: engine.playing ? "pause.fill" : "play.fill", primary: true) {
                    engine.toggle()
                }
                .disabled(engine.duration == 0)
                control("STOP", icon: "stop.fill", primary: false) {
                    engine.stop()
                }
                .disabled(engine.duration == 0)
                Spacer()
                Text(engine.playing ? "PLAYING" : engine.duration > 0 ? "READY" : "EMPTY")
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundStyle(Palette.green)
            }
            Text("REAL AUDIO · DRUM / FM / MASTER LATER")
                .foregroundStyle(Palette.dim)
                .font(.system(size: 10, design: .monospaced))
        }
        .padding(28)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Palette.bg.ignoresSafeArea())
        .preferredColorScheme(.dark)
        .fileImporter(isPresented: $showFiles, allowedContentTypes: [.audio]) { result in
            switch result {
            case .success(let url): engine.importAudio(url)
            case .failure(let error): engine.error = error.localizedDescription
            }
        }
        .alert("TAPE LAB", isPresented: Binding(
            get: { engine.error != nil },
            set: { if !$0 { engine.error = nil } }
        )) {
            Button("OK", role: .cancel) { engine.error = nil }
        } message: {
            Text(engine.error ?? "")
        }
    }

    private func control(_ label: String, icon: String, primary: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(label, systemImage: icon)
                .font(.system(size: 14, weight: .semibold, design: .monospaced))
                .frame(minWidth: 105, minHeight: 56)
                .padding(.horizontal, 8)
                .foregroundStyle(primary ? Palette.bg : Palette.green)
                .background(primary ? Palette.green : Palette.panel, in: RoundedRectangle(cornerRadius: 6))
        }
        .buttonStyle(.plain)
    }
}

@main
struct TapeLabApp: App {
    var body: some Scene {
        WindowGroup { TapeScreen() }
    }
}
