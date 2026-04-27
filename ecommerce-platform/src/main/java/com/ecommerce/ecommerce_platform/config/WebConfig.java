package com.ecommerce.ecommerce_platform.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.ecommerce.ecommerce_platform.security.JwtInterceptor;
////Controls Interceptor and static resource handling. It registers the JwtInterceptor for protected endpoints and configures a resource handler to serve uploaded files from the filesystem, allowing access via the /uploads/** URL pattern.
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private JwtInterceptor jwtInterceptor;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor).addPathPatterns("/products/**", "/users/**", "/orders/**", "/cart/**", "/notifications/**");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String path = java.nio.file.Paths.get(uploadDir).toAbsolutePath().normalize().toUri().toString();
        if (!path.endsWith("/")) {
            path += "/";
        }
        registry.addResourceHandler("/uploads/**").addResourceLocations(path);
    }
}
