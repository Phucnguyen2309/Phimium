package com.be.repository;

import com.be.entity.Activity;
import com.be.entity.InstructionAcknowledgement;
import com.be.entity.Registration;
import com.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstructionAcknowledgementRepository extends JpaRepository<InstructionAcknowledgement, UUID> {

    Optional<InstructionAcknowledgement> findByRegistration(Registration registration);

    List<InstructionAcknowledgement> findByUser(User user);

    List<InstructionAcknowledgement> findByActivity(Activity activity);

    boolean existsByRegistrationAndAcknowledgedTrue(Registration registration);
}
