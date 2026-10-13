package com.be.repository;

import com.be.entity.ItineraryStop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ItineraryStopRepository extends JpaRepository<ItineraryStop, UUID> {
    List<ItineraryStop> findByActivity_IdOrderByStopOrderAscStopIdAsc(UUID activityId);

    Optional<ItineraryStop> findByStopIdAndActivity_Id(UUID stopId, UUID activityId);
}
