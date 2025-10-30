package com.github.pigeon.observability;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AbstractAuthenticationFailureEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.authorization.event.AuthorizationDeniedEvent;
import org.springframework.stereotype.Component;

@Component
class SecurityEventLogger {

    private static final Logger logger = LoggerFactory.getLogger(SecurityEventLogger.class);

    @EventListener
    public void onAuthenticationSuccess(AuthenticationSuccessEvent event) {
        String username = event.getAuthentication().getName();
        logger.info("Authentication successful: username={}", username);
    }

    @EventListener
    public void onAuthenticationFailure(AbstractAuthenticationFailureEvent event) {
        String username = event.getAuthentication().getName();
        String errorType = event.getException().getClass().getSimpleName();
        logger.warn("Authentication failed: username={} errorType={} message={}",
                username, errorType, event.getException().getMessage());
    }

    @EventListener
    public void onAuthorizationDenied(AuthorizationDeniedEvent<?> event) {
        String username = event.getAuthentication() != null 
            ? event.getAuthentication().get().getName() 
            : "anonymous";
        logger.warn("Authorization denied: username={} resource={}", 
                username, event.getAuthorizationDecision());
    }
}
