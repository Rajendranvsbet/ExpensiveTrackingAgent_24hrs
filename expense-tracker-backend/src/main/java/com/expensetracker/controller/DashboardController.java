package com.expensetracker.controller;

import com.expensetracker.dto.DashboardStatsDto;
import com.expensetracker.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Dashboard Services", description = "Consolidated endpoints for visual dashboard tracking components.")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get current dashboard stats summary", description = "Returns active budget remaining balances, period spends, highest category, and recent transaction list.")
    public ResponseEntity<DashboardStatsDto> getDashboardStatistics(Authentication authentication) {
        DashboardStatsDto stats = dashboardService.getDashboardStatistics(authentication.getName());
        return ResponseEntity.ok(stats);
    }
}
