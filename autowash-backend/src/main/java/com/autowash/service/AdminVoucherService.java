package com.autowash.service;

import com.autowash.dto.AdminVoucherRequest;
import com.autowash.dto.AdminVoucherRedemptionResponse;
import com.autowash.dto.AdminVoucherResponse;
import com.autowash.shared.dto.PaginationMeta;
import java.time.Instant;
import java.util.List;

public interface AdminVoucherService {
    List<AdminVoucherResponse> listVouchers();
    AdminVoucherResponse getVoucher(String code);
    AdminVoucherResponse createVoucher(AdminVoucherRequest request);
    AdminVoucherResponse updateVoucher(String code, AdminVoucherRequest request);
    AdminVoucherResponse deleteVoucher(String code);
    RedemptionPage listRedemptions(String searchQuery, Instant dateFrom, Instant dateTo, int page, int limit);

    record RedemptionPage(List<AdminVoucherRedemptionResponse> items, PaginationMeta pagination) {}
}

