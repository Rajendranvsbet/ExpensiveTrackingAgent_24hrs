package com.expensetracker.service;

import com.expensetracker.dto.BudgetDto;
import java.math.BigDecimal;
import java.util.List;

public interface BudgetService {
    BudgetDto createOrUpdateBudget(String email, BudgetDto budgetDto);
    BudgetDto getBudgetForMonth(String email, String month, Integer year);
    List<BudgetDto> getAllBudgets(String email);
    BigDecimal getRemainingBudget(String email, String month, Integer year);
    double getBudgetProgressPercentage(String email, String month, Integer year);
    void deleteBudget(String email, Long id);
}
