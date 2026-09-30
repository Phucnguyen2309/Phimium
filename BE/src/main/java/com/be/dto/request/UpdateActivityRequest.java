package com.be.dto.request;

import com.be.enums.ActivityStatus;
import com.be.enums.TourType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateActivityRequest {

    @NotBlank(message = "Tên hoạt động không được để trống")
    @Schema(example = "Food Tour Đêm Khám Phá Ẩm Thực Chợ Lớn (Nâng Cấp)")
    private String title;

    @Schema(example = "Mô tả chi tiết nội dung tour...")
    private String description;

    @NotNull(message = "Loại tour không được để trống")
    @Schema(example = "FOODTOUR")
    private TourType activityType;

    @Schema(example = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5")
    private String thumbnailUrl;

    @NotBlank(message = "Tên địa điểm không được để trống")
    @Schema(example = "Khu phố cổ Chợ Lớn")
    private String locationName;

    @NotBlank(message = "Địa chỉ không được để trống")
    @Schema(example = "1105 Trần Hưng Đạo, Phường 5, Quận 5, TP. Hồ Chí Minh")
    private String address;

    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    @Schema(example = "106.660172")
    private BigDecimal longitude;

    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    @Schema(example = "10.755432")
    private BigDecimal latitude;

    @NotNull(message = "Phí người lớn không được để trống")
    @DecimalMin(value = "0.0")
    @Schema(example = "350000.0")
    private BigDecimal participationFee;

    @DecimalMin(value = "0.0")
    @Schema(example = "200000.0")
    private BigDecimal childParticipationFee;

    @NotNull(message = "Số khách tối thiểu không được để trống")
    @Min(value = 2, message = "Số lượng khách tối thiểu cho mỗi tour phải từ 2 người trở lên")
    @Schema(example = "2")
    private Integer minimumParticipants;

    @NotNull(message = "Số khách tối đa không được để trống")
    @Min(1)
    @Schema(example = "12")
    private Integer maximumParticipants;

    @Schema(example = "4")
    private Integer groupMinSize;

    @Schema(example = "6")
    private Integer groupMaxSize;

    @Schema(example = "PUBLISHED")
    private ActivityStatus status;
}