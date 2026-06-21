package com.be.repository;

import com.be.entity.Activity;
import com.be.entity.ActivityGroup;
import com.be.entity.Registration;
import com.be.entity.User;
import com.be.enums.CheckInStatus;
import com.be.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

    List<Registration> findByUser(User user);

    List<Registration> findByActivity(Activity activity);

    List<Registration> findByGroup(ActivityGroup group);

    List<Registration> findByStatus(RegistrationStatus status);

    List<Registration> findByCheckInStatusAndActivityEndTimeBefore(
            CheckInStatus checkInStatus,
            LocalDateTime now
    );

    boolean existsByGroupGroupIdAndUserUserId(
            UUID groupId,
            UUID userId
    );
}
