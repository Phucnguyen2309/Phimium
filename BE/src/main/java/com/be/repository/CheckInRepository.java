package com.be.repository;

import com.be.entity.Activity;
import com.be.entity.CheckIn;
import com.be.entity.Registration;
import com.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CheckInRepository extends JpaRepository<CheckIn, UUID> {

    Optional<CheckIn> findByRegistration(Registration registration);

    List<CheckIn> findByUser(User user);

    List<CheckIn> findByActivity(Activity activity);
}
