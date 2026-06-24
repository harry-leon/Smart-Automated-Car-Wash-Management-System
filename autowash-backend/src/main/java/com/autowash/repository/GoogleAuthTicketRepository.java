package com.autowash.repository;

import com.autowash.entity.GoogleAuthTicket;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleAuthTicketRepository extends JpaRepository<GoogleAuthTicket, String> {

    Optional<GoogleAuthTicket> findByState(String state);
}
