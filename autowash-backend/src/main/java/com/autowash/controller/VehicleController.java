package com.autowash.controller;

import com.autowash.shared.dto.ApiResponse;
import com.autowash.dto.CreateVehicleRequest;
import com.autowash.dto.CreateVehicleResponse;
import com.autowash.dto.SetPrimaryVehicleResponse;
import com.autowash.dto.UpdateVehicleRequest;
import com.autowash.dto.UpdateVehicleResponse;
import com.autowash.dto.VehicleDetailResponse;
import com.autowash.dto.VehicleListItemResponse;
import com.autowash.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/customers/vehicles")
@Tag(name = "Vehicles")
@SecurityRequirement(name = "bearerAuth")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    @Operation(summary = "Create new vehicle for customer")
    public ResponseEntity<ApiResponse<CreateVehicleResponse>> createVehicle(@Valid @RequestBody CreateVehicleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Vehicle created successfully", vehicleService.createVehicle(request)));
    }

    @GetMapping
    @Operation(summary = "List all vehicles for authenticated customer")
    public ApiResponse<List<VehicleListItemResponse>> listVehicles(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        VehicleService.VehiclePage vehiclePage = vehicleService.listVehicles(page, limit);
        return ApiResponse.ok("Vehicles retrieved", vehiclePage.vehicles(), vehiclePage.pagination());
    }

    @GetMapping("/{vehicleId}")
    @Operation(summary = "Get single vehicle details")
    public ApiResponse<VehicleDetailResponse> getVehicle(@PathVariable UUID vehicleId) {
        return ApiResponse.ok("Vehicle retrieved", vehicleService.getVehicle(vehicleId));
    }

    @PutMapping("/{vehicleId}")
    @Operation(summary = "Update vehicle details")
    public ApiResponse<UpdateVehicleResponse> updateVehicle(
            @PathVariable UUID vehicleId,
            @Valid @RequestBody UpdateVehicleRequest request
    ) {
        return ApiResponse.ok("Vehicle updated", vehicleService.updateVehicle(vehicleId, request));
    }

    @PostMapping("/{vehicleId}/set-primary")
    @Operation(summary = "Set vehicle as primary for bookings")
    public ApiResponse<SetPrimaryVehicleResponse> setPrimaryVehicle(@PathVariable UUID vehicleId) {
        return ApiResponse.ok("Primary vehicle set", vehicleService.setPrimaryVehicle(vehicleId));
    }

    @DeleteMapping("/{vehicleId}")
    @Operation(summary = "Delete or deactivate vehicle")
    public ResponseEntity<Void> deleteVehicle(@PathVariable UUID vehicleId) {
        vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.noContent().build();
    }
}
