package com.alice.education.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

        @Override
        public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/uploads/**")
                                .addResourceLocations("file:uploads/");
                registry.addResourceHandler("/chapter/**")
                                .addResourceLocations("classpath:/static/chapter/",
                                                "file:src/main/resources/static/chapter/");
                registry.addResourceHandler("/img/avatar/**")
                                .addResourceLocations("classpath:/static/img/avatar/",
                                                "file:src/main/resources/static/img/avatar/");
        }
}