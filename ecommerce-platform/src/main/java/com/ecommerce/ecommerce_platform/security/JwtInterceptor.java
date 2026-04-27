package com.ecommerce.ecommerce_platform.security;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.auth0.jwt.interfaces.DecodedJWT;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
////SECURITY CHECKPOINT: This interceptor checks for a valid JWT token in the Authorization header for protected endpoints. It allows public access to product listing and search endpoints, as well as user signup. For other requests, it verifies the token and extracts user information, attaching it to the request for downstream use. If the token is missing, invalid, or expired, it responds with a 401 Unauthorized status and an appropriate error message.
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String method = request.getMethod();
        String uri = request.getRequestURI();

        // Allow CORS preflight
        if ("OPTIONS".equalsIgnoreCase(method))//Used to know the allowed operations on resources before sending the actual request.
            return true;

        // Public read endpoints for products (index, search, single product)
        if ("GET".equalsIgnoreCase(method)) {
            if ("/products".equals(uri) || uri.startsWith("/products/search")) {
                return true;
            }
            if (uri.startsWith("/products/")) {
                String tail = uri.substring("/products/".length());
                if (tail.matches("\\d+"))
                    return true;
            }
        }

        // Allow public signup
        if ("POST".equalsIgnoreCase(method) && "/users".equals(uri)) {
            return true;
        }

        //Checks if the Authorisation header is present or starts with "Bearer".
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Missing or invalid Authorization header\"}");
            return false;
        }

        //Checks the validation of token.
        String token = auth.substring(7);
        Optional<DecodedJWT> decoded = jwtUtil.verifyToken(token);
        if (decoded.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"TOKEN_EXPIRED\"}");
            return false;
        }

        DecodedJWT jwt = decoded.get();
        Long id = jwt.getClaim("id").asLong();
        String email = jwt.getSubject();
        String role = jwt.getClaim("role").asString();
        request.setAttribute("authUserId", id);
        request.setAttribute("authUserEmail", email);
        request.setAttribute("authUserRole", role);
        return true;
    }
}
