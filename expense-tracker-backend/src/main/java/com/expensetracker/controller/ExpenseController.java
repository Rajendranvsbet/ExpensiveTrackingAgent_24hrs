package com.expensetracker.controller;

import com.expensetracker.dto.ExpenseDto;
import com.expensetracker.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Expenses", description = "Endpoints to create, find, update, filter, and delete personal transactions.")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    @Operation(summary = "Log new transaction")
    public ResponseEntity<ExpenseDto> createExpense(Authentication authentication, @Valid @RequestBody ExpenseDto expenseDto) {
        ExpenseDto response = expenseService.createExpense(authentication.getName(), expenseDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get list of all personal transactions")
    public ResponseEntity<List<ExpenseDto>> getAllExpenses(Authentication authentication) {
        List<ExpenseDto> expenses = expenseService.getAllExpenses(authentication.getName());
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve a transaction detail by ID")
    public ResponseEntity<ExpenseDto> getExpenseById(Authentication authentication, @PathVariable Long id) {
        ExpenseDto expense = expenseService.getExpenseById(authentication.getName(), id);
        return ResponseEntity.ok(expense);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update transaction detail")
    public ResponseEntity<ExpenseDto> updateExpense(Authentication authentication, @PathVariable Long id, @Valid @RequestBody ExpenseDto expenseDto) {
        ExpenseDto response = expenseService.updateExpense(authentication.getName(), id, expenseDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transaction from records")
    public ResponseEntity<Map<String, String>> deleteExpense(Authentication authentication, @PathVariable Long id) {
        expenseService.deleteExpense(authentication.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
    }

    @GetMapping("/filter")
    @Operation(summary = "Search & Filter Transactions", description = "Query results by Category, start/end dates, or amount ranges.")
    public ResponseEntity<List<ExpenseDto>> filterExpenses(
            Authentication authentication,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount) {
        List<ExpenseDto> results = expenseService.searchAndFilter(authentication.getName(), category, startDate, endDate, minAmount, maxAmount);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/today")
    @Operation(summary = "Get today's logged transactions")
    public ResponseEntity<List<ExpenseDto>> getTodayExpenses(Authentication authentication) {
        List<ExpenseDto> results = expenseService.getTodayExpenses(authentication.getName());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/weekly")
    @Operation(summary = "Get weekly transactions (Mon-Sun)")
    public ResponseEntity<List<ExpenseDto>> getWeeklyExpenses(Authentication authentication) {
        List<ExpenseDto> results = expenseService.getWeeklyExpenses(authentication.getName());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/monthly")
    @Operation(summary = "Get transactions for a specific month and year")
    public ResponseEntity<List<ExpenseDto>> getMonthlyExpenses(
            Authentication authentication,
            @RequestParam String month,
            @RequestParam Integer year) {
        List<ExpenseDto> results = expenseService.getMonthlyExpenses(authentication.getName(), month, year);
        return ResponseEntity.ok(results);
    }
}
