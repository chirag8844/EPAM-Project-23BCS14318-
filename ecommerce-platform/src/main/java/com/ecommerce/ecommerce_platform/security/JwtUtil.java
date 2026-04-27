package com.ecommerce.ecommerce_platform.security;

import java.util.Date;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;

@Component
public class JwtUtil {

    @Value("${jwt.secret:change-me-dev-secret}")
    private String secret;

    // Short-lived access token: 15 minutes
    private final long EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

    public String generateToken(Long userId, String email, String role) {
        Algorithm alg = Algorithm.HMAC256(secret);
        return JWT.create()
                .withSubject(email)
                .withClaim("id", userId)
                .withClaim("role", role)
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .sign(alg);
    }

    public Optional<DecodedJWT> verifyToken(String token) {
        try {
            Algorithm alg = Algorithm.HMAC256(secret);
            JWTVerifier verifier = JWT.require(alg).build();
            DecodedJWT jwt = verifier.verify(token);
            return Optional.of(jwt);
        } catch (JWTVerificationException e) {
            return Optional.empty();
        }
    }
}
