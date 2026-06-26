package com.autowash.service;

import com.autowash.dto.AdminComboRequest;
import com.autowash.dto.ComboResponse;
import java.util.List;

public interface AdminComboService {
    List<ComboResponse> listCombos();
    ComboResponse getCombo(String comboId);
    ComboResponse createCombo(AdminComboRequest request);
    ComboResponse updateCombo(String comboId, AdminComboRequest request);
    ComboResponse deleteCombo(String comboId);
}
