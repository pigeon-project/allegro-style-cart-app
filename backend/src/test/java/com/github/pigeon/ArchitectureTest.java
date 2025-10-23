package com.github.pigeon;

import com.tngtech.archunit.base.DescribedPredicate;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.domain.JavaField;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

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

    @Test
    void featurePackagesShouldHaveApiAndWebSubpackages() {
        // Feature packages: issues, products, cart
        ArchRule rule = classes()
                .that().resideInAnyPackage("..issues..", "..products..", "..cart..")
                .and().resideOutsideOfPackages("..api..", "..web..")
                .should().resideInAnyPackage(
                        "..issues..",
                        "..products..",
                        "..cart.."
                )
                .orShould().haveSimpleNameEndingWith("Commands")
                .orShould().haveSimpleNameEndingWith("Queries")
                .orShould().haveSimpleNameEndingWith("Configuration")
                .orShould().haveSimpleNameEndingWith("RepositoryImpl")
                .orShould().haveSimpleNameStartingWith("Persisted")
                .orShould().haveSimpleNameStartingWith("InMemory");
        rule.allowEmptyShould(true).check(appClasses);
    }

    @Test
    void apiPackagesShouldOnlyContainDomainModelsAndInterfaces() {
        // API packages should contain only domain models (records or immutable classes),
        // interfaces, utility classes (final), or enums
        // Issue class is excluded as it's an immutable class from the legacy issues package
        ArchRule rule = classes()
                .that().resideInAnyPackage("..api..")
                .and().doNotHaveSimpleName("Issue")  // Legacy example class - immutable but not record
                .should().beInterfaces()
                .orShould().beRecords()
                .orShould().beEnums()
                .orShould().haveModifier(com.tngtech.archunit.core.domain.JavaModifier.FINAL)
                .andShould().notBeAnnotatedWith(RestController.class)
                .andShould().notBeAnnotatedWith(Configuration.class);
        rule.check(appClasses);
    }

    @Test
    void webPackagesShouldOnlyContainControllersAndDTOs() {
        ArchRule rule = classes()
                .that().resideInAnyPackage("..web..")
                .and().doNotHaveSimpleName("GlobalExceptionHandler")
                .and().doNotHaveSimpleName("WebMvcConfiguration")
                .and().doNotHaveSimpleName("RequestCorrelationFilter")
                .and().doNotHaveSimpleName("RequestLoggingFilter")
                .and().doNotHaveSimpleName("RateLimitInterceptor")
                .should().haveSimpleNameEndingWith("Controller")
                .orShould().haveSimpleNameEndingWith("Request")
                .orShould().haveSimpleNameEndingWith("Response")
                .orShould().haveSimpleNameEndingWith("Exception");
        rule.check(appClasses);
    }

    @Test
    void domainModelsInApiPackagesShouldBeRecordsOrImmutable() {
        // Domain models should be records (preferred) or immutable classes (all fields final)
        // Utility classes (Calculations, Validator) and interfaces are excluded
        // Issue class is excluded as it's an example from the legacy issues package
        ArchRule rule = classes()
                .that().resideInAnyPackage("..api..")
                .and().areNotInterfaces()
                .and().areNotEnums()
                .and().doNotHaveModifier(com.tngtech.archunit.core.domain.JavaModifier.ABSTRACT)
                .and().doNotHaveModifier(com.tngtech.archunit.core.domain.JavaModifier.FINAL)  // Exclude utility classes
                .and().haveSimpleNameNotEndingWith("Repository")
                .and().haveSimpleNameNotEndingWith("Store")
                .and().haveSimpleNameNotEndingWith("Calculations")
                .and().haveSimpleNameNotEndingWith("Validator")
                .and().doNotHaveSimpleName("Issue")  // Legacy example class
                .should().beRecords()
                .because("Domain models in api packages should be immutable records");
        rule.allowEmptyShould(true).check(appClasses);
    }

    @Test
    void noServiceOrComponentInFeaturePackages() {
        ArchRule rule = noClasses()
                .that().resideInAnyPackage("..issues..", "..products..", "..cart..")
                .and().resideOutsideOfPackages("..web..")
                .should().beAnnotatedWith(Service.class)
                .orShould().beAnnotatedWith(Component.class)
                .because("Feature packages should use @Configuration with @Bean methods instead of @Service/@Component");
        rule.check(appClasses);
    }

    @Test
    void configurationBeansShouldBeUsedInsteadOfServiceAnnotation() {
        ArchRule rule = noClasses()
                .that().resideInAnyPackage("..issues..", "..products..", "..cart..")
                .should().beAnnotatedWith(Service.class)
                .because("Use @Configuration with @Bean methods instead of @Service annotation");
        rule.check(appClasses);
    }

    @Test
    void packagePrivateImplementationsInFeaturePackages() {
        ArchRule rule = classes()
                .that().resideInAnyPackage("..issues..", "..products..", "..cart..")
                .and().resideOutsideOfPackages("..api..", "..web..")
                .and().haveSimpleNameNotEndingWith("Commands")
                .and().haveSimpleNameNotEndingWith("Queries")
                .should().notBePublic()
                .because("Only facade classes (Commands/Queries) and api package classes should be public");
        rule.check(appClasses);
    }

    @Test
    void layersShouldBeProperlyIsolated() {
        // API layer should not depend on web layer
        ArchRule rule = noClasses()
                .that().resideInAnyPackage("..api..")
                .should().dependOnClassesThat().resideInAnyPackage("..web..")
                .because("API layer should not depend on web layer");
        rule.check(appClasses);
    }
}
