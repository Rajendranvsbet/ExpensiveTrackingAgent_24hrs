package com.expensetracker.service;

import com.expensetracker.dto.DashboardStatsDto;

public interface DashboardService {
    DashboardStatsDto getDashboardStatistics(String email);
}
