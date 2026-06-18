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

    @Column(name = "fullName")
    private String fullName;

    @Column
    private String email;

    @Column
    private String password;

    @Column
    private String phone;

    @Column
    private UserRole role;

    @Column
    private UserStatus status;

    @Column
    private LocalDateTime created_at;

    @Column
    private LocalDate birthday;

    @Column
    private LocalDateTime updated_at;
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
        created_at = DateTimeUtils.nowVietnam();

        if(status == null){
            status = UserStatus.ACTIVE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updated_at = DateTimeUtils.nowVietnam();
    }


}
