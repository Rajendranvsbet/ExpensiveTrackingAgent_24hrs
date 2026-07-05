package com.expensetracker.service.impl;

import com.expensetracker.dto.BudgetDto;
import com.expensetracker.entity.Budget;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.BudgetService;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final ModelMapper modelMapper;

    public BudgetServiceImpl(BudgetRepository budgetRepository,
                             UserRepository userRepository,
                             ExpenseRepository expenseRepository,
                             ModelMapper modelMapper) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    @Transactional
    public BudgetDto createOrUpdateBudget(String email, BudgetDto budgetDto) {
        log.info("Setting or updating budget for user: {} for {}/{}", email, budgetDto.getMonth(), budgetDto.getYear());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String targetMonth = budgetDto.getMonth().toUpperCase();
        Integer targetYear = budgetDto.getYear();

        // Check if user already has a budget for this month/year
        Optional<Budget> existingBudgetOpt = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), targetMonth, targetYear);
        
        Budget budget;
        if (existingBudgetOpt.isPresent()) {
            budget = existingBudgetOpt.get();
            budget.setMonthlyBudget(budgetDto.getMonthlyBudget());
        } else {
            budget = new Budget();
            budget.setUser(user);
            budget.setMonth(targetMonth);
            budget.setYear(targetYear);
            budget.setMonthlyBudget(budgetDto.getMonthlyBudget());
        }

        // Compute spent amount for this period from existing expenses
        BigDecimal spent = calculateSpentForMonth(user.getId(), targetMonth, targetYear);
        budget.setSpentAmount(spent);
        budget.setRemainingAmount(budget.getMonthlyBudget().subtract(spent));

        Budget savedBudget = budgetRepository.save(budget);
        log.info("Budget set/updated successfully with ID: {}", savedBudget.getId());
        return mapToDto(savedBudget);
    }

    @Override
    public BudgetDto getBudgetForMonth(String email, String month, Integer year) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        Budget budget = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month.toUpperCase(), year)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "month/year", month + "/" + year));
                
        return mapToDto(budget);
    }

    @Override
    public List<BudgetDto> getAllBudgets(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return budgetRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public BigDecimal getRemainingBudget(String email, String month, Integer year) {
        try {
            BudgetDto budgetDto = getBudgetForMonth(email, month, year);
            return budgetDto.getRemainingAmount();
        } catch (ResourceNotFoundException e) {
            return BigDecimal.ZERO;
        }
    }

    @Override
    public double getBudgetProgressPercentage(String email, String month, Integer year) {
        try {
            BudgetDto budgetDto = getBudgetForMonth(email, month, year);
            if (budgetDto.getMonthlyBudget().compareTo(BigDecimal.ZERO) == 0) return 0.0;
            return budgetDto.getSpentAmount()
                    .multiply(new BigDecimal(100))
                    .divide(budgetDto.getMonthlyBudget(), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        } catch (ResourceNotFoundException e) {
            return 0.0;
        }
    }

    @Override
    @Transactional
    public void deleteBudget(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have access to this resource.");
        }

        budgetRepository.delete(budget);
    }

    private BigDecimal calculateSpentForMonth(Long userId, String monthName, int year) {
        try {
            int monthVal = LocalDate.parse("2020-" + monthName.toUpperCase().substring(0, 3) + "-01", 
                    java.time.format.DateTimeFormatter.ofPattern("yyyy-MMM-dd")).getMonthValue();
            LocalDate start = LocalDate.of(year, monthVal, 1);
            LocalDate end = start.with(TemporalAdjusters.lastDayOfMonth());

            BigDecimal sum = expenseRepository.sumExpensesInDateRange(userId, start, end);
            return sum != null ? sum : BigDecimal.ZERO;
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private BudgetDto mapToDto(Budget budget) {
        BudgetDto dto = modelMapper.map(budget, BudgetDto.class);
        dto.setUserId(budget.getUser().getId());
        return dto;
    }
}
