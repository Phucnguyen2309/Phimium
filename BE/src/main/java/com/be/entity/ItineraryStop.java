package com.be.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "itinerary_stops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryStop {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "stop_id", nullable = false, updatable = false)
    private UUID stopId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "activity_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_itinerary_stop_activity"))
    private Activity activity;

    @NotNull
    @Min(0)
    @Column(name = "stop_order", nullable = false)
    private Integer stopOrder;

    @NotBlank
    @Size(max = 200)
    @Column(name = "stop_title", nullable = false, length = 200)
    private String title;

    @NotBlank
    @Size(max = 1000)
    @Column(name = "stop_description", nullable = false, length = 1000)
    private String description;

    @NotNull
    @Min(0)
    @Max(1440)
    @Column(name = "offset_minutes", nullable = false)
    private Integer offsetMinutes;

    @NotNull
    @Min(1)
    @Max(1440)
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Size(max = 2048)
    @Column(name = "image_url", length = 2048)
    private String imageUrl;
}
