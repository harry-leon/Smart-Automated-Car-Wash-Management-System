package com.autowash.operation.application;

import com.autowash.operation.domain.WashSessionStatus;
import com.autowash.operation.presentation.dto.OperationsQueueResponse;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OperationsQueueService {

    public OperationsQueueResponse getQueue() {
        return new OperationsQueueResponse(
                new OperationsQueueResponse.QueueSummary(0, 0, 0, 0, 0),
                List.of(
                        column(WashSessionStatus.PENDING, "Pending"),
                        column(WashSessionStatus.CHECKED_IN, "Checked-In"),
                        column(WashSessionStatus.IN_PROGRESS, "In Progress"),
                        column(WashSessionStatus.COMPLETED, "Completed")
                ),
                Instant.now()
        );
    }

    private OperationsQueueResponse.QueueColumn column(WashSessionStatus status, String label) {
        return new OperationsQueueResponse.QueueColumn(status, label, List.of());
    }
}
