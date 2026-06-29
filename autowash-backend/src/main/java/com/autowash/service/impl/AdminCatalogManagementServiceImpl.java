package com.autowash.service.impl;

import com.autowash.dto.AdminPackageRequest;
import com.autowash.dto.AdminServiceRequest;
import com.autowash.dto.PackageResponse;
import com.autowash.dto.ServiceResponse;
import com.autowash.entity.Package;
import com.autowash.entity.PackageService;
import com.autowash.entity.Service;
import com.autowash.entity.enums.ActiveStatus;
import com.autowash.repository.PackageRepository;
import com.autowash.repository.PackageServiceRepository;
import com.autowash.repository.ServiceRepository;
import com.autowash.service.AdminCatalogManagementService;
import com.autowash.shared.exception.ApiException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class AdminCatalogManagementServiceImpl implements AdminCatalogManagementService {

    private final ServiceRepository serviceRepository;
    private final PackageRepository packageRepository;
    private final PackageServiceRepository packageServiceRepository;

    public AdminCatalogManagementServiceImpl(
            ServiceRepository serviceRepository,
            PackageRepository packageRepository,
            PackageServiceRepository packageServiceRepository
    ) {
        this.serviceRepository = serviceRepository;
        this.packageRepository = packageRepository;
        this.packageServiceRepository = packageServiceRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> listServices() {
        return serviceRepository.findAll().stream()
                .map(this::toServiceResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceResponse getService(String serviceId) {
        return toServiceResponse(requireService(serviceId));
    }

    @Override
    @Transactional
    public ServiceResponse createService(AdminServiceRequest request) {
        Service service = serviceRepository.save(new Service(
                request.name(),
                request.description(),
                request.price(),
                request.durationMinutes(),
                request.imageUrl(),
                statusOrActive(request.status())
        ));
        return toServiceResponse(service);
    }

    @Override
    @Transactional
    public ServiceResponse updateService(String serviceId, AdminServiceRequest request) {
        Service service = requireService(serviceId);
        service.update(
                request.name(),
                request.description(),
                request.price(),
                request.durationMinutes(),
                request.imageUrl(),
                statusOrActive(request.status())
        );
        return toServiceResponse(service);
    }

    @Override
    @Transactional
    public ServiceResponse deleteService(String serviceId) {
        Service service = requireService(serviceId);
        service.deactivate();
        return toServiceResponse(service);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PackageResponse> listPackages() {
        return packageRepository.findAll().stream()
                .map(this::toPackageResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PackageResponse getPackage(String packageId) {
        return toPackageResponse(requirePackage(packageId));
    }

    @Override
    @Transactional
    public PackageResponse createPackage(AdminPackageRequest request) {
        Package pkg = packageRepository.save(new Package(
                request.name(),
                request.description(),
                request.basePrice(),
                request.durationMinutes(),
                request.imageUrl(),
                statusOrActive(request.status())
        ));
        replaceOptions(pkg, request.options());
        return toPackageResponse(pkg);
    }

    @Override
    @Transactional
    public PackageResponse updatePackage(String packageId, AdminPackageRequest request) {
        Package pkg = requirePackage(packageId);
        pkg.update(
                request.name(),
                request.description(),
                request.basePrice(),
                request.durationMinutes(),
                request.imageUrl(),
                statusOrActive(request.status())
        );
        replaceOptions(pkg, request.options());
        return toPackageResponse(pkg);
    }

    @Override
    @Transactional
    public PackageResponse deletePackage(String packageId) {
        Package pkg = requirePackage(packageId);
        pkg.deactivate();
        return toPackageResponse(pkg);
    }

    private void replaceOptions(Package pkg, List<AdminPackageRequest.PackageOptionRequest> options) {
        packageServiceRepository.deleteByPackageId(pkg.getId());
        if (options == null || options.isEmpty()) {
            return;
        }

        LinkedHashSet<UUID> seen = new LinkedHashSet<>();
        List<PackageService> packageServices = options.stream()
                .<PackageService>map(option -> {
                    UUID optionId = parseUuid(option.optionId(), "Service option not found");
                    if (!seen.add(optionId)) {
                        throw validationError("Duplicate service option in package");
                    }
                    Service service = serviceRepository.findByIdAndStatus(optionId, ActiveStatus.ACTIVE)
                            .orElseThrow(() -> validationError("Service option not found or inactive"));
                    return new PackageService(
                            pkg.getId(),
                            service.getId(),
                            service.getName(),
                            service.getDescription(),
                            service.getPrice(),
                            service.getDurationMinutes(),
                            option.quantity() == null ? 1 : option.quantity(),
                            option.sortOrder() == null ? 0 : option.sortOrder()
                    );
                })
                .toList();
        packageServiceRepository.saveAll(packageServices);
    }

    private Service requireService(String serviceId) {
        return serviceRepository.findById(parseUuid(serviceId, "Service not found"))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Service not found", "RESOURCE_NOT_FOUND"));
    }

    private Package requirePackage(String packageId) {
        return packageRepository.findById(parseUuid(packageId, "Package not found"))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Package not found", "RESOURCE_NOT_FOUND"));
    }

    private UUID parseUuid(String id, String message) {
        try {
            return UUID.fromString(id);
        } catch (RuntimeException exception) {
            throw new ApiException(HttpStatus.NOT_FOUND, message, "RESOURCE_NOT_FOUND");
        }
    }

    private ActiveStatus statusOrActive(ActiveStatus status) {
        return status == null ? ActiveStatus.ACTIVE : status;
    }

    private ApiException validationError(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message, "VALIDATION_ERROR");
    }

    private ServiceResponse toServiceResponse(Service service) {
        return new ServiceResponse(
                service.getId().toString(),
                service.getName(),
                service.getDescription(),
                service.getPrice(),
                service.getDurationMinutes(),
                service.getStatus().name(),
                service.getImageUrl()
        );
    }

    private PackageResponse toPackageResponse(Package pkg) {
        List<String> features = packageServiceRepository.findByPackageIdOrderBySortOrderAsc(pkg.getId()).stream()
                .map(PackageService::getOptionName)
                .toList();
        return new PackageResponse(
                pkg.getId().toString(),
                pkg.getName(),
                pkg.getDescription(),
                pkg.getBasePrice(),
                pkg.getDurationMinutes(),
                null,
                features,
                pkg.getImageUrl(),
                pkg.getStatus().name(),
                null
        );
    }
}
