package com.reservation.API_Gateway.Config;


import com.reservation.API_Gateway.Filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;


@Configuration
public class GatewayRouteConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // User Service Routes
                .route("user-service-auth", r -> r
                        .path("/api/auth/**")
                        .uri("lb://user-service")

                )
                .route("user-service-user", r -> r
                        .path("/api/user/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://user-service")

                )

                // Bus Service Routes
                .route("bus-service-bus", r -> r
                        .path("/api/bus/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://bus-service")

                )
                .route("bus-service-route", r -> r
                        .path("/api/route/**")
                        .uri("lb://bus-service")

                )
                .route("bus-service-schedules", r -> r
                        .path("/api/schedules/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://bus-service")

                )
                .route("bus-service-search", r -> r
                        .path("/api/search/**")
                        .uri("lb://bus-service")

                )
                // Booking Service Routes
                .route("booking-service", r -> r
                        .path("/api/bookings/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://booking-service")
                ).build();
    }

    }