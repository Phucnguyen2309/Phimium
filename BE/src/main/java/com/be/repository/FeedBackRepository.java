package com.be.repository;

import com.be.entity.Buddy;
import com.be.entity.FeedBack;
import com.be.entity.Registration;
import com.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FeedBackRepository extends JpaRepository<FeedBack, UUID> {

    List<FeedBack> findByBuddy(Buddy buddy);

    List<FeedBack> findByReviewer(User reviewer);

    Optional<FeedBack> findByRegistration(Registration registration);
}
