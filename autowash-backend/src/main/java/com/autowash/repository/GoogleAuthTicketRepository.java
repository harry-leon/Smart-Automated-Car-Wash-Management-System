package com.autowash.repository;

import com.autowash.entity.GoogleAuthTicket;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleAuthTicketRepository extends JpaRepository<GoogleAuthTicket, UUID> {
    Optional<GoogleAuthTicket> findByState(String state);
}
