package com.autowash.shared.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI autowashOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("AutoWash Backend API")
                        .version("v1")
                        .description("Spring Boot APIs for AutoWash Pro / AURA CAR CARE"));
    }
}
