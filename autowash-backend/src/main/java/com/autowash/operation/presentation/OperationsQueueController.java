package com.autowash.operation.presentation;

import com.autowash.operation.application.OperationsQueueService;
import com.autowash.operation.presentation.dto.OperationsQueueResponse;
import com.autowash.shared.api.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/operations")
public class OperationsQueueController {

    private final OperationsQueueService operationsQueueService;

    public OperationsQueueController(OperationsQueueService operationsQueueService) {
        this.operationsQueueService = operationsQueueService;
    }

    @GetMapping("/queue")
    public ApiResponse<OperationsQueueResponse> getQueue() {
        return ApiResponse.success(HttpStatus.OK, "Operations queue retrieved", operationsQueueService.getQueue());
    }
}
