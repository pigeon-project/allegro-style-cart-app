plugins {
    application
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.test.logger)
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

application {
    mainClass.set("com.github.pigeon.BackendApplication")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(project("backend"))
    implementation(project("frontend"))
}
