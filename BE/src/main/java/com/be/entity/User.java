package com.be.entity;

import com.be.enums.UserRole;
import com.be.enums.UserStatus;
import com.be.util.DateTimeUtils;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;


@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue()
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "full_name")
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String password;

    @Column(name = "google_sub", unique = true)
    private String googleSub;

    @Column(unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column
    private UserStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column
    private LocalDate birthday;

    @Builder.Default
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Builder.Default
    @Column(name = "profile_completed", nullable = false)
    private boolean profileCompleted = false;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null) {
            return List.of();
        }

        return List.of(
                new SimpleGrantedAuthority("ROLE_" + role.name())
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }

    @PrePersist
    public void prePersist() {
        email = email.trim().toLowerCase(java.util.Locale.ROOT);
        createdAt = DateTimeUtils.nowVietnam();

        if(status == null){
            status = UserStatus.ACTIVE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        email = email.trim().toLowerCase(java.util.Locale.ROOT);
        updatedAt = DateTimeUtils.nowVietnam();
    }


}
