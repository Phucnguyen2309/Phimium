package com.be.repository;

import com.be.entity.Activity;
import com.be.enums.ActivityStatus;
import com.be.enums.TourType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    @Query("""
            select distinct a.id from Activity a left join a.itineraryStops s
            where (a.title is not null and trim(a.title) <> '' and (a.titleEn is null or trim(a.titleEn) = ''))
               or (a.description is not null and trim(a.description) <> '' and (a.descriptionEn is null or trim(a.descriptionEn) = ''))
               or (a.locationName is not null and trim(a.locationName) <> '' and (a.locationNameEn is null or trim(a.locationNameEn) = ''))
               or (a.address is not null and trim(a.address) <> '' and (a.addressEn is null or trim(a.addressEn) = ''))
               or (s.title is not null and trim(s.title) <> '' and (s.titleEn is null or trim(s.titleEn) = ''))
               or (s.description is not null and trim(s.description) <> '' and (s.descriptionEn is null or trim(s.descriptionEn) = ''))
            order by a.id
            """)
    List<UUID> findTranslationCandidateIds();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Activity a where a.id = :id")
    Optional<Activity> findByIdWithLock(@Param("id") UUID id);

    List<Activity> findByStatus(ActivityStatus status);

    List<Activity> findByActivityType(TourType activityType);

    List<Activity> findByStatusAndActivityType(ActivityStatus status, TourType activityType);

}
