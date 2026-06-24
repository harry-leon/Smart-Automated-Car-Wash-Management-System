package com.autowash.service;

import com.autowash.entity.User;
import java.util.List;
import java.util.UUID;

public interface StaffAssignmentService {
    User pickLeastLoadedActiveStaff();
    User requireActiveStaff(UUID staffId);
    List<User> listActiveStaff();
}

