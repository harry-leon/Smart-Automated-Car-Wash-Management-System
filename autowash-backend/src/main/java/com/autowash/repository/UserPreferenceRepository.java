package com.autowash.repository;


import com.autowash.entity.*;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, UUID> {
}
