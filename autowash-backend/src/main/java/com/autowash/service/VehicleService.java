package com.autowash.service;

import com.autowash.shared.dto.PaginationMeta;
import com.autowash.dto.CreateVehicleRequest;
import com.autowash.dto.CreateVehicleResponse;
import com.autowash.dto.SetPrimaryVehicleResponse;
import com.autowash.dto.UpdateVehicleRequest;
import com.autowash.dto.UpdateVehicleResponse;
import com.autowash.dto.VehicleDetailResponse;
import com.autowash.dto.VehicleListItemResponse;
import java.util.List;
import java.util.UUID;

public interface VehicleService {
    CreateVehicleResponse createVehicle(CreateVehicleRequest request);
    VehiclePage listVehicles(int page, int limit);
    VehicleDetailResponse getVehicle(UUID vehicleId);
    UpdateVehicleResponse updateVehicle(UUID vehicleId, UpdateVehicleRequest request);
    SetPrimaryVehicleResponse setPrimaryVehicle(UUID vehicleId);
    void deleteVehicle(UUID vehicleId);

    record VehiclePage(
            List<VehicleListItemResponse> vehicles,
            PaginationMeta pagination
    ) {
    }
}

