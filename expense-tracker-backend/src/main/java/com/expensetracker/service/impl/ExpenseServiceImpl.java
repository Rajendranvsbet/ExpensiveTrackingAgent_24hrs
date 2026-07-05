package com.expensetracker.service.impl;

import com.expensetracker.dto.ExpenseDto;
import com.expensetracker.entity.Budget;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.Notification;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.NotificationRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.ExpenseService;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final NotificationRepository notificationRepository;
    private final ModelMapper modelMapper;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository,
                              UserRepository userRepository,
                              BudgetRepository budgetRepository,
                              NotificationRepository notificationRepository,
                              ModelMapper modelMapper) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.budgetRepository = budgetRepository;
        this.notificationRepository = notificationRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    @Transactional
    public ExpenseDto createExpense(String email, ExpenseDto expenseDto) {
        log.info("Creating new expense for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Expense expense = modelMapper.map(expenseDto, Expense.class);
        expense.setUser(user);

        Expense savedExpense = expenseRepository.save(expense);
        
        // Dynamic budget adjustment
        syncBudgetOnExpenseAddition(user, savedExpense.getAmount(), savedExpense.getExpenseDate());

        log.info("Expense successfully saved with id: {}", savedExpense.getId());
        return mapToDto(savedExpense);
    }

    @Override
    public List<ExpenseDto> getAllExpenses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return expenseRepository.findByUserIdOrderByExpenseDateDesc(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ExpenseDto getExpenseById(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));

        validateOwnership(user, expense);
        return mapToDto(expense);
    }

    @Override
    @Transactional
    public ExpenseDto updateExpense(String email, Long id, ExpenseDto expenseDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));

        validateOwnership(user, expense);

        // Reverse old budget impact before updating
        syncBudgetOnExpenseDeletion(user, expense.getAmount(), expense.getExpenseDate());

        expense.setAmount(expenseDto.getAmount());
        expense.setCategory(expenseDto.getCategory());
        expense.setExpenseDate(expenseDto.getExpenseDate());
        expense.setDescription(expenseDto.getDescription());
        expense.setMerchant(expenseDto.getMerchant());
        expense.setPaymentMethod(expenseDto.getPaymentMethod());
        expense.setReceiptImage(expenseDto.getReceiptImage());

        Expense updatedExpense = expenseRepository.save(expense);
        
        // Apply new budget impact
        syncBudgetOnExpenseAddition(user, updatedExpense.getAmount(), updatedExpense.getExpenseDate());

        log.info("Expense with id: {} updated successfully", id);
        return mapToDto(updatedExpense);
    }

    @Override
    @Transactional
    public void deleteExpense(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));

        validateOwnership(user, expense);

        // Adjust active budget limits
        syncBudgetOnExpenseDeletion(user, expense.getAmount(), expense.getExpenseDate());

        expenseRepository.delete(expense);
        log.warn("Expense with id: {} deleted successfully", id);
    }

    @Override
    public List<ExpenseDto> searchAndFilter(String email, String category, LocalDate startDate, LocalDate endDate, BigDecimal minAmount, BigDecimal maxAmount) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return expenseRepository.filterExpenses(user.getId(), category, startDate, endDate, minAmount, maxAmount)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpenseDto> getTodayExpenses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        LocalDate today = LocalDate.now();
        return expenseRepository.findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(user.getId(), today, today)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpenseDto> getWeeklyExpenses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        return expenseRepository.findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(user.getId(), monday, sunday)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpenseDto> getMonthlyExpenses(String email, String month, Integer year) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        LocalDate firstDay = LocalDate.of(year, LocalDate.now().getMonth(), 1).withMonth(getMonthValue(month));
        LocalDate lastDay = firstDay.with(TemporalAdjusters.lastDayOfMonth());
        return expenseRepository.findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(user.getId(), firstDay, lastDay)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private int getMonthValue(String monthName) {
        try {
            return LocalDate.parse("2020-" + monthName.toUpperCase().substring(0, 3) + "-01", 
                    java.time.format.DateTimeFormatter.ofPattern("yyyy-MMM-dd")).getMonthValue();
        } catch (Exception e) {
            return LocalDate.now().getMonthValue();
        }
    }

    private void validateOwnership(User user, Expense expense) {
        if (!expense.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have access to view/modify this expense");
        }
    }

    private void syncBudgetOnExpenseAddition(User user, BigDecimal amount, LocalDate date) {
        String month = date.getMonth().name();
        int year = date.getYear();
        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year);

        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            budget.setSpentAmount(budget.getSpentAmount().add(amount));
            budget.setRemainingAmount(budget.getMonthlyBudget().subtract(budget.getSpentAmount()));
            budgetRepository.save(budget);

            // Check if budget exceeded and fire alert notification
            if (budget.getRemainingAmount().compareTo(BigDecimal.ZERO) < 0) {
                createAlertNotification(user, budget);
            }
        }
    }

    private void syncBudgetOnExpenseDeletion(User user, BigDecimal amount, LocalDate date) {
        String month = date.getMonth().name();
        int year = date.getYear();
        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year);

        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            budget.setSpentAmount(budget.getSpentAmount().subtract(amount));
            if (budget.getSpentAmount().compareTo(BigDecimal.ZERO) < 0) {
                budget.setSpentAmount(BigDecimal.ZERO);
            }
            budget.setRemainingAmount(budget.getMonthlyBudget().subtract(budget.getSpentAmount()));
            budgetRepository.save(budget);
        }
    }

    private void createAlertNotification(User user, Budget budget) {
        String alertTitle = "Budget Alert: " + budget.getMonth() + " limit exceeded!";
        String alertMsg = String.format("You have exceeded your monthly limit of %s. Current spent amount is %s.",
                budget.getMonthlyBudget(), budget.getSpentAmount());
        
        Notification notification = Notification.builder()
                .title(alertTitle)
                .message(alertMsg)
                .status("UNREAD")
                .user(user)
                .build();
        
        notificationRepository.save(notification);
        log.warn("Exceeded budget alert notification fired for user: {}", user.getEmail());
    }

    private ExpenseDto mapToDto(Expense expense) {
        ExpenseDto dto = modelMapper.map(expense, ExpenseDto.class);
        dto.setUserId(expense.getUser().getId());
        return dto;
    }
}
