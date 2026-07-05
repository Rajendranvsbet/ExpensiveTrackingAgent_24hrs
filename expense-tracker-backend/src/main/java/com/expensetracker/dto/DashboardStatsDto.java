package com.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private BigDecimal totalExpenses;
    private BigDecimal currentBudget;
    private BigDecimal spentAmount;
    private BigDecimal remainingBudget;
    
    private BigDecimal todayExpense;
    private BigDecimal weeklyExpense;
    private BigDecimal monthlyExpense;
    
    private String highestCategoryName;
    private BigDecimal highestCategoryAmount;
    
    private String lowestCategoryName;
    private BigDecimal lowestCategoryAmount;
    
    private List<ExpenseDto> recentTransactions;
}
