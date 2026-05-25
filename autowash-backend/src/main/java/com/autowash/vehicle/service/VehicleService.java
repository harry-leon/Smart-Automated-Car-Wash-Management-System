package com.autowash.vehicle.service;

import com.autowash.auth.entity.AuthUser;
import com.autowash.shared.dto.PaginationMeta;
import com.autowash.shared.exception.ApiException;
import com.autowash.user.service.CurrentUserService;
import com.autowash.vehicle.dto.CreateVehicleRequest;
import com.autowash.vehicle.dto.CreateVehicleResponse;
import com.autowash.vehicle.dto.SetPrimaryVehicleResponse;
import com.autowash.vehicle.dto.UpdateVehicleRequest;
import com.autowash.vehicle.dto.UpdateVehicleResponse;
import com.autowash.vehicle.dto.VehicleDetailResponse;
import com.autowash.vehicle.dto.VehicleListItemResponse;
import com.autowash.vehicle.entity.CustomerVehicle;
import com.autowash.vehicle.entity.VehicleStatus;
import com.autowash.vehicle.repository.CustomerVehicleRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VehicleService {

    private final CurrentUserService currentUserService;
    private final CustomerVehicleRepository customerVehicleRepository;

    public VehicleService(CurrentUserService currentUserService, CustomerVehicleRepository customerVehicleRepository) {
        this.currentUserService = currentUserService;
        this.customerVehicleRepository = customerVehicleRepository;
    }

    @Transactional
    public CreateVehicleResponse createVehicle(CreateVehicleRequest request) {
        AuthUser user = currentUserService.getCurrentUser();
        String normalizedPlate = normalizePlate(request.plate());

        if (customerVehicleRepository.existsByOwnerAndPlate(user, normalizedPlate)) {
            throw new ApiException(HttpStatus.CONFLICT, "Plate already exists for this customer", "DUPLICATE_PLATE");
        }

        boolean shouldBePrimary = customerVehicleRepository.countByOwnerAndStatus(user, VehicleStatus.ACTIVE) == 0;
        CustomerVehicle vehicle = new CustomerVehicle(
                user,
                normalizedPlate,
                request.type(),
                request.brand().trim(),
                request.model().trim(),
                request.year(),
                trimToNull(request.color()),
                shouldBePrimary
        );
        customerVehicleRepository.save(vehicle);
        return toCreateResponse(vehicle);
    }

    @Transactional(readOnly = true)
    public VehiclePage listVehicles(int page, int limit) {
        AuthUser user = currentUserService.getCurrentUser();
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), limit);
        Page<CustomerVehicle> vehiclePage = customerVehicleRepository.findByOwnerAndStatusOrderByCreatedAtAsc(
                user,
                VehicleStatus.ACTIVE,
                pageable
        );

        List<VehicleListItemResponse> items = vehiclePage.getContent().stream()
                .map(this::toListItemResponse)
                .toList();

        PaginationMeta pagination = new PaginationMeta(
                vehiclePage.getNumber() + 1,
                vehiclePage.getSize(),
                vehiclePage.getTotalElements(),
                vehiclePage.getTotalPages(),
                vehiclePage.hasNext()
        );
        return new VehiclePage(items, pagination);
    }

    @Transactional(readOnly = true)
    public VehicleDetailResponse getVehicle(UUID vehicleId) {
        return toDetailResponse(findActiveOwnedVehicle(vehicleId));
    }

    @Transactional
    public UpdateVehicleResponse updateVehicle(UUID vehicleId, UpdateVehicleRequest request) {
        CustomerVehicle vehicle = findActiveOwnedVehicle(vehicleId);
        vehicle.updateDetails(
                request.brand().trim(),
                request.model().trim(),
                request.year(),
                trimToNull(request.color())
        );
        return new UpdateVehicleResponse(
                vehicle.getId().toString(),
                vehicle.getPlate(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getColor(),
                vehicle.getUpdatedAt()
        );
    }

    @Transactional
    public SetPrimaryVehicleResponse setPrimaryVehicle(UUID vehicleId) {
        AuthUser user = currentUserService.getCurrentUser();
        CustomerVehicle targetVehicle = findActiveOwnedVehicle(vehicleId);

        customerVehicleRepository.findFirstByOwnerAndStatusAndPrimaryTrue(user, VehicleStatus.ACTIVE)
                .filter(existingPrimary -> !existingPrimary.getId().equals(targetVehicle.getId()))
                .ifPresent(existingPrimary -> existingPrimary.setPrimary(false));

        targetVehicle.setPrimary(true);

        return new SetPrimaryVehicleResponse(
                targetVehicle.getId().toString(),
                targetVehicle.getPlate(),
                targetVehicle.isPrimary(),
                targetVehicle.getUpdatedAt()
        );
    }

    @Transactional
    public void deleteVehicle(UUID vehicleId) {
        AuthUser user = currentUserService.getCurrentUser();
        CustomerVehicle vehicle = findActiveOwnedVehicle(vehicleId);
        boolean wasPrimary = vehicle.isPrimary();
        vehicle.softDelete();

        if (wasPrimary) {
            customerVehicleRepository.findFirstByOwnerAndStatusOrderByCreatedAtAsc(user, VehicleStatus.ACTIVE)
                    .ifPresent(nextPrimary -> nextPrimary.setPrimary(true));
        }
    }

    private CustomerVehicle findActiveOwnedVehicle(UUID vehicleId) {
        AuthUser user = currentUserService.getCurrentUser();
        return customerVehicleRepository.findByOwnerAndIdAndStatus(user, vehicleId, VehicleStatus.ACTIVE)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Vehicle not found", "RESOURCE_NOT_FOUND"));
    }

    private CreateVehicleResponse toCreateResponse(CustomerVehicle vehicle) {
        return new CreateVehicleResponse(
                vehicle.getId().toString(),
                vehicle.getOwner().getId().toString(),
                vehicle.getPlate(),
                vehicle.getType().name(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getColor(),
                vehicle.getStatus().name(),
                vehicle.isPrimary(),
                vehicle.getCreatedAt()
        );
    }

    private VehicleListItemResponse toListItemResponse(CustomerVehicle vehicle) {
        return new VehicleListItemResponse(
                vehicle.getId().toString(),
                vehicle.getPlate(),
                vehicle.getType().name(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getColor(),
                vehicle.isPrimary(),
                vehicle.getStatus().name()
        );
    }

    private VehicleDetailResponse toDetailResponse(CustomerVehicle vehicle) {
        return new VehicleDetailResponse(
                vehicle.getId().toString(),
                vehicle.getOwner().getId().toString(),
                vehicle.getPlate(),
                vehicle.getType().name(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getColor(),
                vehicle.getStatus().name(),
                vehicle.isPrimary(),
                vehicle.getCreatedAt()
        );
    }

    private String normalizePlate(String plate) {
        return plate.trim().toUpperCase();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public record VehiclePage(
            List<VehicleListItemResponse> vehicles,
            PaginationMeta pagination
    ) {
    }
}
