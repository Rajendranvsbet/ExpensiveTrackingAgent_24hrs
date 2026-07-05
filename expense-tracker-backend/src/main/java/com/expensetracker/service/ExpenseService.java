package com.expensetracker.service;

import com.expensetracker.dto.ExpenseDto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseService {
    ExpenseDto createExpense(String email, ExpenseDto expenseDto);
    List<ExpenseDto> getAllExpenses(String email);
    ExpenseDto getExpenseById(String email, Long id);
    ExpenseDto updateExpense(String email, Long id, ExpenseDto expenseDto);
    void deleteExpense(String email, Long id);
    
    // Custom filtering / search APIs
    List<ExpenseDto> searchAndFilter(String email, String category, LocalDate startDate, LocalDate endDate, BigDecimal minAmount, BigDecimal maxAmount);
    List<ExpenseDto> getTodayExpenses(String email);
    List<ExpenseDto> getWeeklyExpenses(String email);
    List<ExpenseDto> getMonthlyExpenses(String email, String month, Integer year);
}
