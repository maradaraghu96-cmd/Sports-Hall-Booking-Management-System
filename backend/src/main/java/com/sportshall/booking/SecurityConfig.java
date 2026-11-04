
package com.sportshall.booking;

import com.sportshall.booking.service.CustomUserDetailsService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Content-Type",
                        "Authorization",
                        "X-Requested-With"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            DaoAuthenticationProvider authenticationProvider,
            SecurityContextRepository securityContextRepository)
            throws Exception {

        http
            .cors(Customizer.withDefaults())

            .csrf(csrf -> csrf.disable())

            .authenticationProvider(authenticationProvider)

            .securityContext(context -> context
                    .securityContextRepository(
                            securityContextRepository
                    )
            )

            .authorizeHttpRequests(auth -> auth

                    // Allow browser preflight requests.
                    .requestMatchers(
                            HttpMethod.OPTIONS, "/**"
                    ).permitAll()

                    // Public health endpoint.
                    .requestMatchers(
                            HttpMethod.GET, "/api/health"
                    ).permitAll()

                    // Existing public registration and login endpoints.
                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/auth/register",
                            "/api/auth/send-otp",
                            "/api/auth/verify-otp",
                            "/api/auth/login"
                    ).permitAll()

                    // NEW: Invited users can accept an invitation
                    // without logging in first.
                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/auth/admin-invitations/accept"
                    ).permitAll()

                    // Only SUPER_ADMIN can manage invitations.
                    .requestMatchers(
                            "/api/admin/invitations/**"
                    ).hasRole("SUPER_ADMIN")
                    // Anyone can check availability before logging in.
.requestMatchers(
        HttpMethod.GET,
        "/api/bookings/availability"
).permitAll()

                    // Other admin APIs require ADMIN or SUPER_ADMIN.
                    .requestMatchers(
                            "/api/admin/**"
                    ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                    // All remaining endpoints require authentication.
                    .anyRequest().authenticated()
            );

        return http.build();
    }
}
