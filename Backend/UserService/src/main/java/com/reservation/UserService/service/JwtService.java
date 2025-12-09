package com.reservation.UserService.service;



import com.reservation.UserService.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpiration;

    //Retrieves the subject (i.e., username/email) from the token.
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /*
    Generic method to extract any claim using a lambda function.
    It first gets the full claims object and applies the resolver.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        User user = (User) userDetails; // Your User entity implements UserDetails

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getUserId());
        extraClaims.put("role", user.getRole().name());

        return generateToken(extraClaims, userDetails);
       // return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }
    /*
    generateToken(user) →
    generateToken(extraClaims={}, user) →
        buildToken(extraClaims, user, expiration) →
            return JWT string
            Each level just adds flexibility and separation of concerns.
     */
    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
//        System.out.println("Authorities from UserDetails: " + userDetails.getAuthorities());
        return Jwts.builder()
                .setClaims(extraClaims) // Custom claims
                .setSubject(userDetails.getUsername()) // The user identity (typically email)
                .setIssuedAt(new Date(System.currentTimeMillis())) // When issued
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // Expiry time
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Signing the token
                .compact(); // Final JWT string
    }

    //Username in token matches actual user.
    //Token is not expired.
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
//Converts the secret string into a cryptographic key used to sign/validate JWTs.
    private Key getSignInKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);

    }
}