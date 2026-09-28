package com.be.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    @Schema(description = "Tổng doanh thu từ các đơn tour thành công (VNĐ)", example = "15000000")
    private BigDecimal totalRevenue;

    @Schema(description = "Tổng số lượt đặt tour trên hệ thống", example = "120")
    private long totalBookings;

    @Schema(description = "Tổng số tài khoản khách hàng (role USER)", example = "85")
    private long totalUsers;

    @Schema(description = "Số lượng Buddy đang ở trạng thái ACTIVE", example = "12")
    private long activeBuddies;

    @Schema(description = "Số đơn đang chờ thanh toán", example = "3")
    private long pendingPayments;

    @Schema(description = "Số đơn đã trả tiền đang chờ xếp Buddy", example = "2")
    private long waitingForBuddyCount;

    @Schema(description = "Danh sách 5 đơn đặt tour mới nhất")
    private List<RegistrationResponse> recentRegistrations;
}