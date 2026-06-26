package com.autowash.service;

import com.autowash.dto.AdminPackageRequest;
import com.autowash.dto.AdminServiceRequest;
import com.autowash.dto.PackageResponse;
import com.autowash.dto.ServiceResponse;
import java.util.List;

public interface AdminCatalogManagementService {

    List<ServiceResponse> listServices();

    ServiceResponse getService(String serviceId);

    ServiceResponse createService(AdminServiceRequest request);

    ServiceResponse updateService(String serviceId, AdminServiceRequest request);

    ServiceResponse deleteService(String serviceId);


    List<PackageResponse> listPackages();

    PackageResponse getPackage(String packageId);

    PackageResponse createPackage(AdminPackageRequest request);

    PackageResponse updatePackage(String packageId, AdminPackageRequest request);

    PackageResponse deletePackage(String packageId);
}
