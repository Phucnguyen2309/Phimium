package com.be.repository;

import com.be.entity.Activity;
import com.be.entity.ActivityGroup;
import com.be.enums.GroupStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ActivityGroupRepository extends JpaRepository<ActivityGroup, UUID> {

    List<ActivityGroup> findByActivity(Activity activity);

    List<ActivityGroup> findByStatus(GroupStatus status);

    List<ActivityGroup> findByStatusAndActivityStartTimeLessThanEqualAndActivityEndTimeAfter(
            GroupStatus status,
            LocalDateTime nowStart,
            LocalDateTime nowEnd
    );

    List<ActivityGroup> findByStatusInAndActivityEndTimeLessThanEqual(
            Collection<GroupStatus> statuses,
            LocalDateTime now
    );


}
