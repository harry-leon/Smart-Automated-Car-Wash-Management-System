package com.autowash.operation;

import com.autowash.entity.enums.WashSessionStatus;
import com.autowash.service.WashSessionLifecycle;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

public class TransitionDiagnosticTest {

    @Test
    void printUnexpectedAllowedTransitions() {
        Set<String> valid = Set.of(
                "PENDING->PENDING",
                "PENDING->CHECKED_IN",
                "CHECKED_IN->IN_PROGRESS",
                "IN_PROGRESS->COMPLETED"
        );

        Set<String> unexpected = new HashSet<>();

        for (WashSessionStatus current : WashSessionStatus.values()) {
            for (WashSessionStatus next : WashSessionStatus.values()) {
                boolean allowed = WashSessionLifecycle.isValidTransition(current, next);
                String key = current + "->" + next;
                if (allowed && !valid.contains(key)) {
                    unexpected.add(key);
                }
            }
        }

        System.out.println("Unexpected allowed transitions: " + unexpected);
        // keep test passing; this is diagnostic output
    }
}
