package com.be.repository;

import com.be.entity.Buddy;
import com.be.entity.User;
import com.be.enums.BuddyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BuddyRepository extends JpaRepository<Buddy, UUID> {

    List<Buddy> findByStatus(BuddyStatus status);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select b from Buddy b where b.status = :status order by b.buddyId")
    List<Buddy> findActiveWithLock(@org.springframework.data.repository.query.Param("status") BuddyStatus status);


    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select b from Buddy b where b.buddyId = :id")
    Optional<Buddy> findByIdWithLock(@org.springframework.data.repository.query.Param("id") UUID id);

    Optional<Buddy> findByUser_UserId(UUID userId);

    @org.springframework.data.jpa.repository.Query("""
        select distinct b from Buddy b join b.interests i
        where b.status = :status and b.user.status = :userStatus and b.user.role = :role
          and i in :tags
          and (:language is null or :language member of b.languages)
          and (:style is null or b.guidingStyle = :style)
        order by b.averageRating desc, b.totalReviews desc, b.buddyId
        """)
    List<Buddy> findMatchingCandidates(
            @org.springframework.data.repository.query.Param("tags") java.util.Set<com.be.enums.MatchingTag> tags,
            @org.springframework.data.repository.query.Param("status") BuddyStatus status,
            @org.springframework.data.repository.query.Param("userStatus") com.be.enums.UserStatus userStatus,
            @org.springframework.data.repository.query.Param("role") com.be.enums.UserRole role,
            @org.springframework.data.repository.query.Param("language") String language,
            @org.springframework.data.repository.query.Param("style") com.be.enums.GuidingStyle style,
            org.springframework.data.domain.Pageable pageable);


    boolean existsByUser_UserId(UUID userId);

    long countByStatus(BuddyStatus status);
}
