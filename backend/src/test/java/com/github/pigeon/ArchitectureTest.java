package com.github.pigeon;

import com.tngtech.archunit.base.DescribedPredicate;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.domain.JavaField;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RestController;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;

class ArchitectureTest {

    private final JavaClasses appClasses = new ClassFileImporter()
            .withImportOption(new ImportOption.DoNotIncludeTests())
            .importPackages("com.github.pigeon");

    @Test
    void controllersShouldBePackagePrivate() {
        ArchRule rule = classes()
                .that().areAnnotatedWith(RestController.class)
                .should()
                .haveSimpleNameEndingWith("Controller")
                .andShould()
                .resideInAnyPackage("..web..")
                .andShould()
                .notBePublic();
        rule.check(appClasses);
    }

    @Test
    void onlyConfigurationClassesShouldBeAnnotatedWithConfiguration() {
        ArchRule rule = classes()
                .that().areAnnotatedWith(Configuration.class)
                .should()
                .haveSimpleNameEndingWith("Configuration")
                .andShould()
                .notBePublic();
        rule.check(appClasses);
    }

    @Test
    void repositoryShouldNotBePublic() {
        ArchRule rule = classes()
                .that()
                .areAnnotatedWith(Repository.class)
                .should()
                .notBePublic();
        rule.allowEmptyShould(true).check(appClasses);
    }

    @Test
    void noFieldInjectionAllowed() {
        ArchRule rule = classes()
                .should()
                .onlyAccessFieldsThat(new DescribedPredicate<>("no field injection") {
                    @Override
                    public boolean test(JavaField javaField) {
                        return javaField.getAnnotations().stream().noneMatch(annotation -> annotation.getRawType().getSimpleName().equals("Autowired"));
                    }
                });
        rule.check(appClasses);
    }

    @Test
    void noDeprecatedSpringApisUsed() {
        ArchRule rule = classes()
                .should()
                .notBeAnnotatedWith(Deprecated.class);
        rule.check(appClasses);
    }

    @Test
    void configurationClassesShouldBePackagePrivate() {
        ArchRule rule = classes()
                .that().areAnnotatedWith(Configuration.class)
                .should().notBePublic();
        rule.check(appClasses);
    }

    @Test
    void onlyFacadesShouldBePublicInFeaturePackages() {
        ArchRule rule = classes()
                .that()
                .haveSimpleNameEndingWith("Commands")
                .or()
                .haveSimpleNameEndingWith("Queries")
                .should().bePublic();
        rule.check(appClasses);
    }
}
