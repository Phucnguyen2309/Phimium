package com.be.repository;

import com.be.entity.Buddy;
import com.be.enums.BuddyStatus;
import com.be.enums.GuidingStyle;
import com.be.enums.MatchingTag;
import com.be.enums.UserRole;
import com.be.enums.UserStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface BuddyRepository extends JpaRepository<Buddy, UUID> {

    List<Buddy> findByStatus(BuddyStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Buddy b where b.status = :status order by b.buddyId")
    List<Buddy> findActiveWithLock(@Param("status") BuddyStatus status);


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Buddy b where b.buddyId = :id")
    Optional<Buddy> findByIdWithLock(@Param("id") UUID id);

    Optional<Buddy> findByUser_UserId(UUID userId);

    @Query("""
        select distinct b from Buddy b join b.interests i
        where b.status = :status and b.user.status = :userStatus and b.user.role = :role
          and i in :tags
          and (:language is null or :language member of b.languages)
          and (:style is null or b.guidingStyle = :style)
        order by b.averageRating desc, b.totalReviews desc, b.buddyId
        """)
    List<Buddy> findMatchingCandidates(
            @Param("tags") Set<MatchingTag> tags,
            @Param("status") BuddyStatus status,
            @Param("userStatus") UserStatus userStatus,
            @Param("role") UserRole role,
            @Param("language") String language,
            @Param("style") GuidingStyle style,
            Pageable pageable);


    boolean existsByUser_UserId(UUID userId);

    long countByStatus(BuddyStatus status);
}
