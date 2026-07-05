package com.expensetracker.service.impl;

import com.expensetracker.dto.DashboardStatsDto;
import com.expensetracker.dto.ExpenseDto;
import com.expensetracker.entity.Budget;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.DashboardService;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final ModelMapper modelMapper;

    public DashboardServiceImpl(UserRepository userRepository,
                                ExpenseRepository expenseRepository,
                                BudgetRepository budgetRepository,
                                ModelMapper modelMapper) {
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public DashboardStatsDto getDashboardStatistics(String email) {
        log.info("Calculating dashboard statistics for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Long userId = user.getId();
        LocalDate today = LocalDate.now();
        String currentMonth = today.getMonth().name();
        int currentYear = today.getYear();

        // 1. All Expenses
        List<Expense> allExpenses = expenseRepository.findByUserIdOrderByExpenseDateDesc(userId);
        BigDecimal totalExpenses = allExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Active Budget
        Optional<Budget> activeBudgetOpt = budgetRepository.findByUserIdAndMonthAndYear(userId, currentMonth, currentYear);
        BigDecimal currentBudget = activeBudgetOpt.map(Budget::getMonthlyBudget).orElse(BigDecimal.ZERO);
        BigDecimal spentAmount = activeBudgetOpt.map(Budget::getSpentAmount).orElse(BigDecimal.ZERO);
        BigDecimal remainingBudget = activeBudgetOpt.map(Budget::getRemainingAmount).orElse(BigDecimal.ZERO);

        // 3. Time Frame Spends
        BigDecimal todayExpense = expenseRepository.sumTodayExpenses(userId, today);
        if (todayExpense == null) todayExpense = BigDecimal.ZERO;

        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        BigDecimal weeklyExpense = expenseRepository.sumExpensesInDateRange(userId, monday, sunday);
        if (weeklyExpense == null) weeklyExpense = BigDecimal.ZERO;

        LocalDate firstOfDoc = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate lastOfDoc = today.with(TemporalAdjusters.lastDayOfMonth());
        BigDecimal monthlyExpense = expenseRepository.sumExpensesInDateRange(userId, firstOfDoc, lastOfDoc);
        if (monthlyExpense == null) monthlyExpense = BigDecimal.ZERO;

        // 4. Highest/Lowest category calculations
        Map<String, BigDecimal> categoryTotals = allExpenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        String highestCategoryName = "None";
        BigDecimal highestCategoryAmount = BigDecimal.ZERO;
        String lowestCategoryName = "None";
        BigDecimal lowestCategoryAmount = BigDecimal.ZERO;

        if (!categoryTotals.isEmpty()) {
            Optional<Map.Entry<String, BigDecimal>> maxCategory = categoryTotals.entrySet().stream()
                    .max(Map.Entry.comparingByValue());
            if (maxCategory.isPresent()) {
                highestCategoryName = maxCategory.get().getKey();
                highestCategoryAmount = maxCategory.get().getValue();
            }

            Optional<Map.Entry<String, BigDecimal>> minCategory = categoryTotals.entrySet().stream()
                    .min(Map.Entry.comparingByValue());
            if (minCategory.isPresent()) {
                lowestCategoryName = minCategory.get().getKey();
                lowestCategoryAmount = minCategory.get().getValue();
            }
        }

        // 5. Recent 5 Transactions
        List<ExpenseDto> recentTransactions = allExpenses.stream()
                .limit(5)
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return DashboardStatsDto.builder()
                .totalExpenses(totalExpenses)
                .currentBudget(currentBudget)
                .spentAmount(spentAmount)
                .remainingBudget(remainingBudget)
                .todayExpense(todayExpense)
                .weeklyExpense(weeklyExpense)
                .monthlyExpense(monthlyExpense)
                .highestCategoryName(highestCategoryName)
                .highestCategoryAmount(highestCategoryAmount)
                .lowestCategoryName(lowestCategoryName)
                .lowestCategoryAmount(lowestCategoryAmount)
                .recentTransactions(recentTransactions)
                .build();
    }

    private ExpenseDto mapToDto(Expense expense) {
        ExpenseDto dto = modelMapper.map(expense, ExpenseDto.class);
        dto.setUserId(expense.getUser().getId());
        return dto;
    }
}
