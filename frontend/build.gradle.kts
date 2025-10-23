import com.github.gradle.node.npm.task.NpmTask

plugins {
    `java-library`
    id("com.github.node-gradle.node") version "7.1.0"
}

node {
    download = true
    version = "24.10.0"
}

tasks.build {
    dependsOn(tasks.named("npmInstall"))
    dependsOn(tasks.named("npmBuild"))
}

tasks.test {
    dependsOn(tasks.named("npmInstall"))
    dependsOn(tasks.named("npmTest"))
}

tasks.register<NpmTask>("npmBuild") {
    dependsOn(tasks.named("npmInstall"))
    mustRunAfter(tasks.named("npmInstall"))
    args.set(listOf("run", "build"))
    inputs.dir(project.fileTree("src").exclude("**/*.test.ts"))
    inputs.dir(project.fileTree("public"))
    inputs.files("*.html", "*.json", "*.ts", "*.js", "*.tsx", "*.jsx")
    outputs.dir(project.layout.buildDirectory.dir("dist"))
    dependsOn(tasks.named("npmTest"))
}

tasks.register<NpmTask>("npmTest") {
    dependsOn(tasks.named("npmInstall"))
    mustRunAfter(tasks.named("npmInstall"))
    args.set(listOf("run", "test"))
    inputs.dir(project.fileTree("src"))
    inputs.dir(project.fileTree("public"))
    inputs.files("*.html", "*.json", "*.ts", "*.js", "*.tsx", "*.jsx")
    outputs.upToDateWhen { true }
}

tasks.jar {
    dependsOn(tasks.named("npmBuild"))
    from(project.layout.buildDirectory.dir("dist"))
}

