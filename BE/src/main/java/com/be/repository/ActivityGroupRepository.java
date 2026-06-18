package com.be.repository;

import com.be.entity.Activity;
import com.be.entity.ActivityGroup;
import com.be.enums.GroupStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityGroupRepository extends JpaRepository<ActivityGroup, UUID> {

    List<ActivityGroup> findByActivity(Activity activity);

    List<ActivityGroup> findByStatus(GroupStatus status);
}
