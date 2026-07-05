package com.expensetracker.controller;

import com.expensetracker.dto.BudgetDto;
import com.expensetracker.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Budgets", description = "Endpoints to create, view, and update monthly limit configurations.")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    @Operation(summary = "Set or update budget", description = "Establishes a limit constraint for a month/year. Updates it if already exists.")
    public ResponseEntity<BudgetDto> createOrUpdateBudget(Authentication authentication, @Valid @RequestBody BudgetDto budgetDto) {
        BudgetDto response = budgetService.createOrUpdateBudget(authentication.getName(), budgetDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/month")
    @Operation(summary = "Get active budget details for a month")
    public ResponseEntity<BudgetDto> getBudgetForMonth(
            Authentication authentication,
            @RequestParam String month,
            @RequestParam Integer year) {
        BudgetDto budget = budgetService.getBudgetForMonth(authentication.getName(), month, year);
        return ResponseEntity.ok(budget);
    }

    @GetMapping
    @Operation(summary = "Get list of all set budgets")
    public ResponseEntity<List<BudgetDto>> getAllBudgets(Authentication authentication) {
        List<BudgetDto> budgets = budgetService.getAllBudgets(authentication.getName());
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/remaining")
    @Operation(summary = "Get remaining budget balance for a month")
    public ResponseEntity<Map<String, BigDecimal>> getRemainingBudget(
            Authentication authentication,
            @RequestParam String month,
            @RequestParam Integer year) {
        BigDecimal remaining = budgetService.getRemainingBudget(authentication.getName(), month, year);
        return ResponseEntity.ok(Map.of("remainingAmount", remaining));
    }

    @GetMapping("/progress")
    @Operation(summary = "Get progress percentage towards limits")
    public ResponseEntity<Map<String, Double>> getProgressPercentage(
            Authentication authentication,
            @RequestParam String month,
            @RequestParam Integer year) {
        double progress = budgetService.getBudgetProgressPercentage(authentication.getName(), month, year);
        return ResponseEntity.ok(Map.of("progressPercentage", progress));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove budget threshold rule")
    public ResponseEntity<Map<String, String>> deleteBudget(Authentication authentication, @PathVariable Long id) {
        budgetService.deleteBudget(authentication.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Budget threshold removed successfully"));
    }
}
