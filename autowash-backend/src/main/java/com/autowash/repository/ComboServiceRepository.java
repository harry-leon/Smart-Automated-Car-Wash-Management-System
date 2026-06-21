package com.autowash.repository;

import com.autowash.entity.ComboService;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComboServiceRepository extends JpaRepository<ComboService, ComboService.ComboServiceId> {
    List<ComboService> findByComboIdOrderBySortOrderAsc(UUID comboId);

    List<ComboService> findByComboIdAndOptionIdIn(UUID comboId, Collection<UUID> optionIds);
}
