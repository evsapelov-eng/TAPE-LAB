// swift-tools-version: 5.9
import PackageDescription
import AppleProductTypes

let package = Package(
    name: "TAPE LAB",
    platforms: [.iOS("16.0")],
    products: [
        .iOSApplication(
            name: "TAPE LAB",
            targets: ["AppModule"],
            bundleIdentifier: "com.evsapelov.tapelab",
            displayVersion: "0.1.0",
            bundleVersion: "1",
            appIcon: .placeholder(icon: .pencil),
            accentColor: .presetColor(.green),
            supportedDeviceFamilies: [.pad],
            supportedInterfaceOrientations: [.landscapeLeft, .landscapeRight]
        )
    ],
    targets: [
        .executableTarget(name: "AppModule", path: ".", exclude: ["README.md", "DEVELOPMENT.md", "Package.swift"])
    ]
)
