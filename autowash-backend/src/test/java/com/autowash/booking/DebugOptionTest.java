package com.autowash.booking;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import com.autowash.repository.ServiceRepository;
import com.autowash.entity.enums.ActiveStatus;
@SpringBootTest
@ActiveProfiles("test")
class DebugOptionTest {
    @Autowired
    private ServiceRepository serviceRepository;
    @Test
    void debugServices() {
        System.out.println("SERVICES: " + serviceRepository.findAll());
        System.out.println("FIND: " + serviceRepository.findByIdAndStatus(java.util.UUID.fromString("33333333-1234-1234-1234-123456789012"), ActiveStatus.ACTIVE).isPresent());
    }
}