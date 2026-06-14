package com.autowash.architecture;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

class PackageByLayerStructureTest {

    private static final Pattern FEATURE_LAYER_PACKAGE = Pattern.compile(
            "^package com\\.autowash\\.(admin|auth|booking|catalog|loyalty|operation|user|vehicle)\\."
                    + "(controller|dto|entity|repository|service);$");

    @Test
    void backendUsesPackageByLayerForApplicationCode() throws IOException {
        Path sourceRoot = Path.of("src", "main", "java", "com", "autowash");

        List<Path> featureLayerFiles;
        try (var files = Files.walk(sourceRoot)) {
            featureLayerFiles = files
                    .filter(path -> path.toString().endsWith(".java"))
                    .filter(path -> path.getFileName() != null)
                    .filter(path -> !path.getFileName().toString().equals("AutowashBackendApplication.java"))
                    .filter(path -> packageDeclaration(path).map(FEATURE_LAYER_PACKAGE.asMatchPredicate()::test).orElse(false))
                    .toList();
        }

        assertThat(featureLayerFiles)
                .as("application code should be grouped by layer packages such as com.autowash.service")
                .isEmpty();
    }

    private static java.util.Optional<String> packageDeclaration(Path path) {
        try {
            return Files.lines(path)
                    .filter(line -> line.startsWith("package "))
                    .findFirst()
                    .map(String::trim);
        } catch (IOException exception) {
            throw new IllegalStateException("Cannot read " + path, exception);
        }
    }
}
